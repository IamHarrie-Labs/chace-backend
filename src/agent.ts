/**
 * Agent execution engine — backed by SQLite.
 */

import cron from "node-cron";
import { randomUUID } from "crypto";
import { deployAgentWallet, revokeAgentWallet } from "./wallet.js";
import { getSwapQuote, executeSwap, formatQuote } from "./omniston.js";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { toNano } from "@ton/ton";
import type { AgentSession, ParsedIntent, TxRecord } from "./types.js";
import {
  saveSession, updateSession, loadSession, loadUserSessions,
  loadAllActiveSessions, saveTx, saveChatMessage, loadChatHistory,
} from "./db.js";

// ── In-memory runtime state (scheduler + notifiers) ───────────────────────────

const scheduledTasks = new Map<string, ReturnType<typeof cron.schedule>>();
const notifiers      = new Map<string, (msg: string) => Promise<void>>();

// ── Boot: re-schedule any sessions that were active before restart ────────────

export async function restoreActiveSessions() {
  const active = loadAllActiveSessions();
  for (const s of active) {
    console.log(`[agent] Restoring session ${s.id}`);
    scheduleAgent(s.id, s.intent);
  }
  console.log(`[agent] Restored ${active.length} active session(s)`);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getSession(id: string): AgentSession | null {
  return loadSession(id);
}

export function getUserSessions(userId: number): AgentSession[] {
  return loadUserSessions(userId);
}

export async function createAgentSession(
  userId: number,
  chatId: number,
  intent: ParsedIntent
): Promise<AgentSession> {
  const id = randomUUID();

  const wallet = await deployAgentWallet(intent.totalAmount);
  const mnemonic = await mnemonicNew(24);

  const session: AgentSession = {
    id, userId, chatId, wallet, intent,
    swapsCompleted: 0,
    swapsTotal: intent.splits ?? 1,
    nextSwapAt: intent.action === "dca"
      ? Date.now() + (intent.intervalMinutes ?? 60) * 60_000
      : Date.now(),
    status: "active",
    txHistory: [],
  };

  saveSession(session, mnemonic);

  // Greet in chat history
  saveChatMessage(id, "agent",
    `Agent deployed. I'll ${describeIntent(intent)}. You can ask me anything here.`
  );

  scheduleAgent(id, intent);
  console.log(`[agent] Session ${id} created for user ${userId}`);
  return session;
}

export async function revokeSession(
  sessionId: string,
  notifyFn?: (msg: string) => Promise<void>
): Promise<string> {
  const row = loadSession(sessionId);
  if (!row) throw new Error(`Session ${sessionId} not found`);

  const operatorKP = await mnemonicToPrivateKey(row.mnemonic);
  stopScheduledAgent(sessionId);

  const withdrawn = await revokeAgentWallet(row.wallet, operatorKP.secretKey);
  row.status = "revoked";
  updateSession(row);

  const msg = withdrawn === "empty"
    ? "Agent revoked. Wallet was already empty."
    : `Agent revoked. Withdrew ${withdrawn} TON back to your main wallet.`;

  if (notifyFn) await notifyFn(msg);
  return msg;
}

export function setSessionNotifier(sessionId: string, fn: (msg: string) => Promise<void>) {
  notifiers.set(sessionId, fn);
}

export function getChatHistory(sessionId: string) {
  return loadChatHistory(sessionId);
}

export function addChatMessage(sessionId: string, role: 'user' | 'agent', content: string) {
  saveChatMessage(sessionId, role, content);
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

function scheduleAgent(sessionId: string, intent: ParsedIntent) {
  if (intent.action === "swap") {
    setTimeout(() => runAgentSwap(sessionId), 2_000);
    return;
  }

  // DCA: run first swap shortly then on interval
  setTimeout(() => runAgentSwap(sessionId), 3_000);

  const intervalMin = Math.max(1, Math.floor(intent.intervalMinutes ?? 60));
  const cronExpr = intervalMin >= 60
    ? `0 */${Math.floor(intervalMin / 60)} * * *`   // hourly+
    : `*/${intervalMin} * * * *`;                    // sub-hour

  const task = cron.schedule(cronExpr, () => runAgentSwap(sessionId));
  scheduledTasks.set(sessionId, task);
}

function stopScheduledAgent(sessionId: string) {
  const task = scheduledTasks.get(sessionId);
  if (task) { task.stop(); scheduledTasks.delete(sessionId); }
}

async function runAgentSwap(sessionId: string) {
  const row = loadSession(sessionId);
  if (!row || row.status !== "active") return;

  if (row.swapsCompleted >= row.swapsTotal) {
    row.status = "completed";
    stopScheduledAgent(sessionId);
    updateSession(row);
    return;
  }

  const perSwap = row.intent.totalAmount / row.swapsTotal;

  try {
    console.log(`[agent] Swap ${row.swapsCompleted + 1}/${row.swapsTotal} for ${sessionId}`);

    const quote = await getSwapQuote(
      row.intent.fromToken, row.intent.toToken, toNano(perSwap.toString())
    );

    const txHash = await executeSwap(row.wallet.address, row.mnemonic, quote);

    const tx: TxRecord = {
      txHash,
      action:       `${row.intent.fromToken}→${row.intent.toToken}`,
      inputAmount:  quote.inputAmount,
      outputAmount: quote.outputAmount,
      timestamp:    Date.now(),
      note:         formatQuote(quote),
    };

    saveTx(sessionId, tx);
    row.swapsCompleted++;
    row.wallet.spentAmount += quote.inputAmount;

    if (row.swapsCompleted >= row.swapsTotal) {
      row.status = "completed";
      stopScheduledAgent(sessionId);
    } else {
      row.nextSwapAt = Date.now() + (row.intent.intervalMinutes ?? 60) * 60_000;
    }

    updateSession(row);

    const notifyMsg =
      `✅ Swap ${row.swapsCompleted}/${row.swapsTotal}\n${formatQuote(quote)}` +
      (row.status === "completed" ? "\n\nAll done! Agent complete." : "");

    notifiers.get(sessionId)?.call(null, notifyMsg).catch(console.error);
    saveChatMessage(sessionId, "agent", notifyMsg);

  } catch (err) {
    const msg = `⚠️ Swap ${row.swapsCompleted + 1} failed: ${(err as Error).message}`;
    console.error(`[agent] ${msg}`);
    notifiers.get(sessionId)?.call(null, msg).catch(console.error);
    saveChatMessage(sessionId, "agent", msg);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function describeIntent(intent: ParsedIntent): string {
  if (intent.action === "dca") {
    return `DCA ${intent.totalAmount} ${intent.fromToken} → ${intent.toToken} over ${intent.splits} buys every ${intent.intervalMinutes}min`;
  }
  return `swap ${intent.totalAmount} ${intent.fromToken} → ${intent.toToken}`;
}
