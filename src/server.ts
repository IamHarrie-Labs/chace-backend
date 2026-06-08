/**
 * Main entry point — starts both the Telegram bot and the API server.
 * Run: npm run server
 */

import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { config } from "./config.js";
import { parseIntent, generateActionSummary, generateMiraDeepLink } from "./mira.js";
import { getMasterAddress, getMasterBalance } from "./wallet.js";
import {
  createAgentSession, revokeSession, getSession,
  getUserSessions, setSessionNotifier, restoreActiveSessions,
} from "./agent.js";
import { startApiServer } from "./api.js";
import type { AgentSession } from "./types.js";

// ── Restore persisted sessions on boot ───────────────────────────────────────
restoreActiveSessions().catch(console.error);

// ── Start API server ──────────────────────────────────────────────────────────
startApiServer();

// ── Bot ───────────────────────────────────────────────────────────────────────
const bot = new Bot(config.telegram.botToken);

const pendingConfirm = new Map<number, {
  summary: string;
  intent: Awaited<ReturnType<typeof parseIntent>>;
}>();

// /start
bot.command("start", async (ctx) => {
  await ctx.reply(
    `👋 *Welcome to Chace*\n\n` +
    `Delegate DeFi to AI agents. DCA, limit orders, yield — all running in isolated wallets you can revoke instantly.\n\n` +
    `*Tap the button below to open the app* — or type a command:\n` +
    `• "DCA 30 TON into USDT over 6 buys every hour"\n` +
    `• "Swap 5 TON for USDT"\n` +
    `• "Buy TON when price drops below $3.80"`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .webApp("📱 Open Chace", config.telegram.miniAppUrl)
        .row()
        .url("🔍 Ask Mira for ideas", generateMiraDeepLink()),
    }
  );
});

// /app
bot.command("app", async (ctx) => {
  await ctx.reply("Open the Chace mini-app:", {
    reply_markup: new InlineKeyboard()
      .webApp("📱 Open Chace", config.telegram.miniAppUrl),
  });
});

// /agents
bot.command("agents", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  const active = getUserSessions(userId).filter(s => s.status === "active");
  if (!active.length) {
    await ctx.reply("No active agents. Send me an instruction to start one.");
    return;
  }
  for (const s of active) {
    await ctx.reply(formatCard(s), {
      parse_mode: "Markdown",
      reply_markup: revokeKb(s.id),
    });
  }
});

// /revoke
bot.command("revoke", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  const active = getUserSessions(userId).filter(s => s.status === "active");
  if (!active.length) { await ctx.reply("No active agents."); return; }

  const kb = new InlineKeyboard();
  for (const s of active) {
    kb.text(`🛑 ${s.intent.action.toUpperCase()} ${s.intent.totalAmount} TON`, `revoke:${s.id}`).row();
  }
  await ctx.reply("Which agent?", { reply_markup: kb });
});

bot.callbackQuery(/^revoke:(.+)$/, async (ctx) => {
  const sessionId = ctx.match[1];
  await ctx.answerCallbackQuery("Revoking…");
  const s = getSession(sessionId);
  if (!s || s.userId !== ctx.from.id) {
    await ctx.editMessageText("Session not found."); return;
  }
  try {
    const result = await revokeSession(sessionId);
    await ctx.editMessageText(`🛑 *Revoked*\n\n${result}`, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.editMessageText(`Failed: ${(err as Error).message}`);
  }
});

bot.callbackQuery("confirm:yes", async (ctx) => {
  const userId = ctx.from.id;
  const pending = pendingConfirm.get(userId);
  if (!pending) { await ctx.answerCallbackQuery("Expired."); return; }
  pendingConfirm.delete(userId);
  await ctx.answerCallbackQuery("Deploying…");
  await ctx.editMessageText("⏳ Deploying agent wallet…");

  try {
    const session = await createAgentSession(userId, ctx.chat?.id ?? userId, pending.intent);
    setSessionNotifier(session.id, msg =>
      bot.api.sendMessage(session.chatId, msg, { parse_mode: "Markdown" }).then(() => {})
    );
    await ctx.editMessageText(
      `✅ *Agent live*\n\n${formatCard(session)}`,
      { parse_mode: "Markdown", reply_markup: revokeKb(session.id) }
    );
  } catch (err) {
    await ctx.editMessageText(`❌ ${(err as Error).message}`);
  }
});

bot.callbackQuery("confirm:no", async (ctx) => {
  pendingConfirm.delete(ctx.from.id);
  await ctx.answerCallbackQuery("Cancelled.");
  await ctx.editMessageText("Cancelled. Send a new instruction whenever you're ready.");
});

// Free text
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith("/")) return;

  const thinking = await ctx.reply("🤔 Thinking…");
  try {
    const intent = await parseIntent(text);

    if (intent.action === "unknown" || intent.confidence < 0.5) {
      await ctx.api.editMessageText(ctx.chat.id, thinking.message_id, intent.reasoning);
      return;
    }
    if (intent.totalAmount <= 0) {
      await ctx.api.editMessageText(ctx.chat.id, thinking.message_id,
        "Please specify an amount. E.g. 'Swap *10 TON* for USDT'");
      return;
    }

    const summary = await generateActionSummary(intent);
    pendingConfirm.set(ctx.from.id, { summary, intent });

    await ctx.api.editMessageText(
      ctx.chat.id, thinking.message_id,
      `*Here's what I'll do:*\n\n${summary}`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("✅ Confirm & delegate", "confirm:yes")
          .text("❌ Cancel", "confirm:no"),
      }
    );
  } catch (err) {
    await ctx.api.editMessageText(ctx.chat.id, thinking.message_id,
      `Something went wrong: ${(err as Error).message}`);
  }
});

bot.catch(err => console.error("[bot] Error:", err));
bot.start({ onStart: () => console.log("[bot] Chace bot running") });

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCard(s: AgentSession): string {
  const emoji = { active:"🟢", paused:"🟡", revoked:"🔴", completed:"✅", pending:"⏳" }[s.status] ?? "⚪";
  const next = s.nextSwapAt && s.status === "active" ? `\nNext: ${timeUntil(s.nextSwapAt)}` : "";
  return (
    `${emoji} *${s.intent.action.toUpperCase()} Agent*\n` +
    `${s.intent.totalAmount} ${s.intent.fromToken} → ${s.intent.toToken}\n` +
    `Progress: ${s.swapsCompleted}/${s.swapsTotal}` + next
  );
}

function revokeKb(id: string) {
  return new InlineKeyboard().text("🛑 Revoke", `revoke:${id}`);
}

function timeUntil(ts: number): string {
  const ms = ts - Date.now();
  if (ms <= 0) return "soon";
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
