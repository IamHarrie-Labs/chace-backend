/**
 * Express API server — connects the Telegram mini-app to the bot backend.
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/sessions/:userId        — list all sessions for a user
 *   GET  /api/sessions/:userId/:id    — get one session + tx history + chat
 *   POST /api/chat/:sessionId         — send a message, get AI reply
 *   POST /api/revoke/:sessionId       — revoke an agent
 *   POST /api/launch                  — create a new agent from the mini-app
 */

import express from "express";
import cors from "cors";
import crypto from "crypto";
import { config } from "./config.js";
import { getMasterBalance } from "./wallet.js";
import {
  getSession, getUserSessions, createAgentSession, revokeSession,
  getChatHistory, addChatMessage,
} from "./agent.js";
import { chatWithAgent } from "./mira.js";
import { loadTxHistory } from "./db.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Telegram initData auth ────────────────────────────────────────────────────

function verifyTelegramAuth(initData: string): { userId: number; username?: string } | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(config.telegram.botToken)
      .digest();

    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (expectedHash !== hash) return null;

    const user = JSON.parse(params.get("user") ?? "{}");
    return { userId: user.id, username: user.username };
  } catch {
    return null;
  }
}

// In dev, accept a plain userId header so we can test without Telegram
function getUserId(req: express.Request): number | null {
  // Try Telegram initData first
  const initData = req.headers["x-telegram-init-data"] as string;
  if (initData) {
    const auth = verifyTelegramAuth(initData);
    if (auth) return auth.userId;
  }
  // Dev fallback: plain userId header
  if (config.app.isDev) {
    const devId = req.headers["x-user-id"];
    if (devId) return Number(devId);
  }
  return null;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  const balance = await getMasterBalance().catch(() => "?");
  res.json({ ok: true, balance, network: config.ton.network });
});

app.get("/api/sessions/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const sessions = getUserSessions(userId).map(s => ({
    id:             s.id,
    status:         s.status,
    action:         s.intent.action,
    fromToken:      s.intent.fromToken,
    toToken:        s.intent.toToken,
    totalAmount:    s.intent.totalAmount,
    swapsCompleted: s.swapsCompleted,
    swapsTotal:     s.swapsTotal,
    nextSwapAt:     s.nextSwapAt,
    walletAddress:  s.wallet.address,
    createdAt:      s.wallet.createdAt,
  }));
  res.json({ sessions });
});

app.get("/api/sessions/:userId/:id", (req, res) => {
  const session = getSession(req.params.id);
  if (!session || session.userId !== Number(req.params.userId)) {
    return res.status(404).json({ error: "Not found" });
  }

  const txHistory = loadTxHistory(session.id).map(tx => ({
    txHash:       tx.txHash,
    action:       tx.action,
    inputAmount:  tx.inputAmount.toString(),
    outputAmount: tx.outputAmount?.toString(),
    timestamp:    tx.timestamp,
    note:         tx.note,
  }));

  const chat = getChatHistory(session.id);

  res.json({
    id:             session.id,
    status:         session.status,
    intent:         session.intent,
    walletAddress:  session.wallet.address,
    swapsCompleted: session.swapsCompleted,
    swapsTotal:     session.swapsTotal,
    nextSwapAt:     session.nextSwapAt,
    txHistory,
    chat,
  });
});

app.post("/api/chat/:sessionId", async (req, res) => {
  const { message } = req.body as { message: string };
  if (!message?.trim()) return res.status(400).json({ error: "message required" });

  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });

  // Save user message
  addChatMessage(session.id, "user", message);

  // Get AI reply from Gemini
  const history = getChatHistory(session.id);
  const reply   = await chatWithAgent(session, history, message);

  // Save agent reply
  addChatMessage(session.id, "agent", reply);

  res.json({ reply });
});

app.post("/api/revoke/:sessionId", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const session = getSession(req.params.sessionId);
  if (!session || session.userId !== userId) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const result = await revokeSession(req.params.sessionId);
    res.json({ ok: true, message: result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/launch", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { type, from, to, amount, buys, intervalMinutes } = req.body as {
    type: string; from: string; to: string;
    amount: number; buys?: number; intervalMinutes?: number;
  };

  const intent = {
    action:          type === 'dca' ? 'dca' as const : 'swap' as const,
    fromToken:       from,
    toToken:         to,
    totalAmount:     amount,
    splits:          buys ?? 1,
    intervalMinutes: intervalMinutes ?? 60,
    reasoning:       `Launch ${type} ${amount} ${from} → ${to}`,
    confidence:      1,
  };

  try {
    const session = await createAgentSession(userId, userId, intent);
    res.json({ ok: true, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

export function startApiServer() {
  const port = config.app.port;
  app.listen(port, () => {
    console.log(`[api] Server running on http://localhost:${port}`);
  });
}

export default app;
