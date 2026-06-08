import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { config } from "./config.js";
import { parseIntent, generateActionSummary, generateMiraDeepLink } from "./mira.js";
import { getMasterAddress, getMasterBalance } from "./wallet.js";
import {
  createAgentSession,
  revokeSession,
  getSession,
  getUserSessions,
  setSessionNotifier,
} from "./agent.js";
import type { AgentSession } from "./types.js";

const bot = new Bot(config.telegram.botToken);

// Pending confirmations: userId → { intent, summary }
const pendingConfirm = new Map<number, { summary: string; intent: Awaited<ReturnType<typeof parseIntent>> }>();

// ── /start ────────────────────────────────────────────────────────────────

bot.command("start", async (ctx) => {
  const masterAddr = await getMasterAddress().catch(() => "wallet not configured");
  const balance = await getMasterBalance().catch(() => "?");

  const miraLink = generateMiraDeepLink("what defi opportunities exist on TON right now");

  await ctx.reply(
    `👋 Welcome to *Chace*\n\n` +
    `Safe autonomous DeFi on TON. Tell me what you want done — I'll execute it in an isolated wallet you can revoke at any time.\n\n` +
    `Your wallet: \`${masterAddr}\`\n` +
    `Balance: *${balance} TON*\n\n` +
    `*Try:*\n` +
    `• "Swap 5 TON for USDT"\n` +
    `• "DCA 30 TON into USDT over 6 buys, every hour"\n\n` +
    `Commands:\n` +
    `/agents — view active agents\n` +
    `/revoke — kill an agent`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url("🔍 Ask Mira for ideas", miraLink),
    }
  );
});

// ── /agents ───────────────────────────────────────────────────────────────

bot.command("agents", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const active = getUserSessions(userId).filter(s => s.status === "active");
  if (!active.length) {
    await ctx.reply("No active agents. Send me a swap or DCA instruction to start one.");
    return;
  }

  for (const session of active) {
    await ctx.reply(formatSessionCard(session), {
      parse_mode: "Markdown",
      reply_markup: revokeKeyboard(session.id),
    });
  }
});

// ── /revoke ───────────────────────────────────────────────────────────────

bot.command("revoke", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const active = getUserSessions(userId).filter(s => s.status === "active");
  if (!active.length) {
    await ctx.reply("No active agents to revoke.");
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const s of active) {
    keyboard.text(
      `🛑 ${s.intent.action.toUpperCase()} ${s.intent.totalAmount} TON → ${s.intent.toToken}`,
      `revoke:${s.id}`
    ).row();
  }

  await ctx.reply("Which agent do you want to revoke?", { reply_markup: keyboard });
});

// ── Inline button: revoke ─────────────────────────────────────────────────

bot.callbackQuery(/^revoke:(.+)$/, async (ctx) => {
  const sessionId = ctx.match[1];
  const userId = ctx.from.id;

  await ctx.answerCallbackQuery("Revoking...");

  const session = getSession(sessionId);
  if (!session || session.userId !== userId) {
    await ctx.editMessageText("Session not found or access denied.");
    return;
  }

  try {
    const result = await revokeSession(sessionId);
    await ctx.editMessageText(`🛑 *Agent revoked*\n\n${result}`, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.editMessageText(`Failed to revoke: ${(err as Error).message}`);
  }
});

// ── Inline button: confirm intent ─────────────────────────────────────────

bot.callbackQuery("confirm:yes", async (ctx) => {
  const userId = ctx.from.id;
  const pending = pendingConfirm.get(userId);
  if (!pending) {
    await ctx.answerCallbackQuery("Session expired. Please try again.");
    return;
  }

  pendingConfirm.delete(userId);
  await ctx.answerCallbackQuery("Starting agent...");
  await ctx.editMessageText("⏳ Deploying your agent wallet and funding it...");

  try {
    const session = await createAgentSession(userId, ctx.chat?.id ?? userId, pending.intent);

    setSessionNotifier(session.id, async (msg) => {
      await bot.api.sendMessage(session.chatId, msg, { parse_mode: "Markdown" });
    });

    await ctx.editMessageText(
      `✅ *Agent is live*\n\n` +
      formatSessionCard(session),
      {
        parse_mode: "Markdown",
        reply_markup: revokeKeyboard(session.id),
      }
    );
  } catch (err) {
    await ctx.editMessageText(`❌ Failed to start agent: ${(err as Error).message}`);
  }
});

bot.callbackQuery("confirm:no", async (ctx) => {
  const userId = ctx.from.id;
  pendingConfirm.delete(userId);
  await ctx.answerCallbackQuery("Cancelled.");
  await ctx.editMessageText("Cancelled. Send a new instruction whenever you're ready.");
});

// ── Free text: parse intent ───────────────────────────────────────────────

bot.on("message:text", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  if (text.startsWith("/")) return; // ignore unknown commands

  const thinking = await ctx.reply("🤔 Thinking...");

  try {
    const intent = await parseIntent(text);

    if (intent.action === "unknown" || intent.confidence < 0.5) {
      await ctx.api.editMessageText(ctx.chat.id, thinking.message_id, intent.reasoning);
      return;
    }

    if (intent.totalAmount <= 0) {
      await ctx.api.editMessageText(ctx.chat.id, thinking.message_id, "Please specify an amount. For example: 'Swap *10 TON* for USDT'");
      return;
    }

    const summary = await generateActionSummary(intent);
    pendingConfirm.set(userId, { summary, intent });

    const keyboard = new InlineKeyboard()
      .text("✅ Confirm & delegate", "confirm:yes")
      .text("❌ Cancel", "confirm:no");

    await ctx.api.editMessageText(
      ctx.chat.id,
      thinking.message_id,
      `*Here's what I'll do:*\n\n${summary}`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (err) {
    await ctx.api.editMessageText(
      ctx.chat.id,
      thinking.message_id,
      `Something went wrong: ${(err as Error).message}`
    );
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

function formatSessionCard(session: AgentSession): string {
  const statusEmoji = { active: "🟢", paused: "🟡", revoked: "🔴", completed: "✅", pending: "⏳" }[session.status];
  const nextSwap = session.nextSwapAt && session.status === "active"
    ? `\nNext swap: ${timeUntil(session.nextSwapAt)}`
    : "";

  return (
    `${statusEmoji} *${session.intent.action.toUpperCase()} Agent*\n` +
    `Budget: ${session.intent.totalAmount} TON → ${session.intent.toToken}\n` +
    `Progress: ${session.swapsCompleted}/${session.swapsTotal} swaps\n` +
    `Wallet: \`${session.wallet.address.slice(0, 12)}…\`` +
    nextSwap
  );
}

function revokeKeyboard(sessionId: string) {
  return new InlineKeyboard().text("🛑 Revoke Agent", `revoke:${sessionId}`);
}

function timeUntil(ts: number): string {
  const ms = ts - Date.now();
  if (ms <= 0) return "soon";
  const min = Math.floor(ms / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

// ── Start ─────────────────────────────────────────────────────────────────

bot.start({ onStart: () => console.log("[bot] Delegate bot is running") });

bot.catch((err) => console.error("[bot] Error:", err));
