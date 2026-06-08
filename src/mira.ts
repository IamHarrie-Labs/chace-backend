/**
 * AI layer — Gemini for intent parsing + agent chat replies.
 * Mira (@mira on Telegram) is integrated as a UX deep-link only.
 */

import axios from "axios";
import { config } from "./config.js";
import type { ParsedIntent, AgentSession } from "./types.js";

const client = axios.create({
  baseURL: config.gemini.baseUrl,
  headers: {
    Authorization: `Bearer ${config.gemini.apiKey}`,
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

async function gemini(messages: { role: string; content: string }[], temp = 0.2): Promise<string> {
  const res = await client.post("/chat/completions", {
    model: config.gemini.model,
    messages,
    temperature: temp,
  });
  return res.data?.choices?.[0]?.message?.content ?? "";
}

// ── Intent parsing ────────────────────────────────────────────────────────────

const INTENT_SYSTEM = `You are a DeFi intent parser for Chace, a TON blockchain assistant.
The user wants to delegate a financial action to an autonomous agent.

Supported actions:
- "dca"   — recurring buys over time (Dollar Cost Average)
- "swap"  — single one-time exchange
- "limit" — watch price and buy when it drops to a target
- "yield" — deposit into a yield pool and auto-compound

Return ONLY valid JSON with these keys:
- action: "dca" | "swap" | "limit" | "yield" | "unknown"
- fromToken: token to spend (e.g. "TON", "USDT")
- toToken: token to receive
- totalAmount: total amount in TON (number)
- splits: number of buys (DCA only)
- intervalMinutes: minutes between DCA buys (DCA only)
- limitPrice: USD price target (limit only)
- reasoning: one sentence explaining what you understood
- confidence: 0.0 to 1.0

Respond with only valid JSON — no markdown fences, no extra text.`;

export async function parseIntent(userMessage: string): Promise<ParsedIntent> {
  const raw = await gemini([
    { role: "system", content: INTENT_SYSTEM },
    { role: "user", content: userMessage },
  ], 0.1);

  try {
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned) as ParsedIntent;
  } catch {
    return {
      action: "unknown",
      fromToken: "TON", toToken: "USDT",
      totalAmount: 0,
      reasoning: "I couldn't understand that. Try: 'DCA 30 TON into USDT over 6 buys every hour'",
      confidence: 0,
    };
  }
}

export async function generateActionSummary(intent: ParsedIntent): Promise<string> {
  if (intent.action === "dca") {
    const perBuy = (intent.totalAmount / (intent.splits ?? 1)).toFixed(2);
    return (
      `DCA ${intent.totalAmount} ${intent.fromToken} → ${intent.toToken}\n` +
      `• ${intent.splits} buys of ~${perBuy} ${intent.fromToken} each\n` +
      `• Every ${((intent.intervalMinutes ?? 60) / 60).toFixed(1)}h via STON.fi\n\n` +
      `Dedicated wallet funded with ${intent.totalAmount} ${intent.fromToken}. Revoke anytime.`
    );
  }
  if (intent.action === "limit") {
    return (
      `Limit order: buy ${intent.fromToken} when price < $${intent.limitPrice}\n` +
      `• ${intent.totalAmount} ${intent.fromToken} locked and ready\n\n` +
      `Agent monitors 24/7. Fires once on trigger.`
    );
  }
  if (intent.action === "yield") {
    return (
      `Yield farming ${intent.totalAmount} ${intent.fromToken} on STON.fi\n` +
      `• Auto-compounds harvested rewards\n\n` +
      `Dedicated wallet funded. Revoke anytime to exit pool.`
    );
  }
  return (
    `Swap ${intent.totalAmount} ${intent.fromToken} → ${intent.toToken} in one tx via STON.fi.\n\n` +
    `Dedicated wallet funded. Your main wallet stays untouched.`
  );
}

// ── Agent chat ────────────────────────────────────────────────────────────────

export async function chatWithAgent(
  session: AgentSession,
  history: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const systemPrompt = buildAgentPersona(session);

  // Keep last 10 exchanges to stay within context
  const recentHistory = history.slice(-20).map(m => ({
    role:    m.role === 'agent' ? 'assistant' : 'user',
    content: m.content,
  }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: userMessage },
  ];

  try {
    const reply = await gemini(messages, 0.7);
    return reply.trim() || "I'm monitoring the market. Check back soon.";
  } catch (err) {
    console.error("[mira] Chat error:", err);
    return "Having trouble connecting right now. Try again in a moment.";
  }
}

function buildAgentPersona(session: AgentSession): string {
  const { action, fromToken, toToken, totalAmount, splits, intervalMinutes, limitPrice } = session.intent;
  const progress = `${session.swapsCompleted}/${session.swapsTotal} completed`;

  const personas: Record<string, string> = {
    dca: `You are an autonomous DCA agent for the Chace app running on TON blockchain.
Your mandate: DCA ${totalAmount} ${fromToken} → ${toToken} over ${splits} buys every ${intervalMinutes} minutes.
Progress: ${progress}. Status: ${session.status}.
Answer questions about your strategy, progress, and market conditions. Be concise and direct. You are a bot, not a human.`,

    swap: `You are an autonomous swap agent for the Chace app running on TON blockchain.
Your mandate: swap ${totalAmount} ${fromToken} → ${toToken} in one transaction via STON.fi Omniston.
Status: ${session.status}.
Answer questions about the swap status and execution. Be concise.`,

    limit: `You are an autonomous limit-order agent for the Chace app running on TON blockchain.
Your mandate: buy ${fromToken} when price drops below $${limitPrice ?? '?'}. Watching 24/7.
${totalAmount} ${fromToken} is locked and ready. Status: ${session.status}.
Answer questions about price levels and trigger conditions. Be concise.`,

    yield: `You are an autonomous yield-farming agent for the Chace app running on TON blockchain.
Your mandate: deposit ${totalAmount} ${fromToken} into STON.fi liquidity pool and auto-compound rewards.
Status: ${session.status}.
Answer questions about APY, pool performance, and compounding. Be concise.`,
  };

  return personas[action] ?? personas.swap;
}

// ── Mira deep link ────────────────────────────────────────────────────────────

export function generateMiraDeepLink(context?: string): string {
  const payload = context
    ? `${config.mira.skillSlug}_${encodeURIComponent(context)}`
    : config.mira.skillSlug;
  return `https://t.me/${config.mira.botUsername}?start=${payload}`;
}
