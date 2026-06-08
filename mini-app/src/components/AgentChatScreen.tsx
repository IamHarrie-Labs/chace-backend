import React, { useState, useRef, useEffect } from "react";
import type { Agent, ChatMessage } from "../types";
import { useTheme } from "../ThemeContext";
import { api, type ApiTx } from "../api";
import ChaceMark from "./ChaceMark";

interface Props {
  agent: Agent;
  walletAddress: string;
  initialTab?: 'chat' | 'analytics';
  onAddMessage: (agentId: number, msg: ChatMessage) => void;
  onBack: () => void;
  onRevoke: (id: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

/** Smart contextual fallback — reads the user's message and responds relevantly */
function getSmartReply(agent: Agent, userMsg: string): string {
  const m = userMsg.toLowerCase();
  const pct = agent.totalBuys > 0 ? Math.round((agent.completedBuys / agent.totalBuys) * 100) : 0;

  // Status / progress
  if (/status|progress|how.*going|update|report/.test(m)) {
    if (agent.type === 'dca' && agent.totalBuys > 0)
      return `Progress: ${agent.completedBuys} of ${agent.totalBuys} buys completed (${pct}%). ${agent.nextIn !== '—' ? `Next execution in ${agent.nextIn}.` : 'All buys are done.'} Funded: ${agent.amount}.`;
    if (agent.type === 'limit')
      return `Still watching. I trigger the moment the price hits your target. No action needed — I'm monitoring 24/7.`;
    if (agent.type === 'yield')
      return `Auto-compounding is active. Your ${agent.amount} is working. Yield accumulates each cycle.`;
    if (agent.type === 'bills')
      return `Bills agent is active. ${agent.subtitle}. I'll execute the payment on schedule and notify you.`;
    return `Agent is ${agent.status}. ${agent.subtitle}.`;
  }

  // Next execution
  if (/next|when|schedule|time/.test(m)) {
    if (agent.nextIn && agent.nextIn !== '—')
      return `Next execution in ${agent.nextIn}. I run automatically — you don't need to do anything.`;
    if (agent.type === 'limit')
      return `I'll execute the moment the market hits your price target. No fixed schedule — purely price-triggered.`;
    return `This strategy runs continuously. Check the Analytics tab for the full execution history.`;
  }

  // Price / market
  if (/price|market|ton|usdt|eth|btc|rate|worth/.test(m)) {
    if (agent.type === 'dca')
      return `DCA works regardless of price — that's the point. By buying on a fixed schedule, you average out the highs and lows automatically.`;
    if (agent.type === 'limit')
      return `I'm watching the price in real-time. The moment it dips to your target, I'll execute the swap immediately.`;
    return `I track market conditions continuously. The current strategy is ${agent.subtitle}.`;
  }

  // Stop / revoke / cancel
  if (/stop|cancel|revoke|end|pause|quit/.test(m)) {
    return `To stop this agent, tap the REVOKE button at the top of this screen. Your remaining funds will be returned to your wallet immediately — no lock-up.`;
  }

  // Funds / balance / amount
  if (/fund|balance|amount|money|ton|how much/.test(m)) {
    return `This agent is funded with ${agent.amount}. ${agent.totalBuys > 0 ? `${agent.completedBuys} of ${agent.totalBuys} executions done.` : ''} Revoke at any time to reclaim unused funds.`;
  }

  // Profit / P&L / earnings
  if (/profit|earn|gain|loss|p.l|return|yield/.test(m)) {
    if (agent.type === 'yield')
      return `Yield is compounding automatically. Open the Analytics tab to see the full transaction history and amounts earned.`;
    if (agent.type === 'dca')
      return `DCA builds your position over time. P&L depends on market movement after each buy. Check Analytics for the full breakdown.`;
    return `Open the Analytics tab (button in the header) to see all executed transactions and amounts.`;
  }

  // Help / what can you do
  if (/help|what|can you|how do|explain/.test(m)) {
    const descriptions: Record<string, string> = {
      dca:   `I buy a fixed amount of crypto on a set schedule — dollar-cost averaging your entry price. Ask me about status, next buy, or funds.`,
      limit: `I watch the market and execute a swap the moment the price hits your target. Ask me about price, status, or to stop watching.`,
      yield: `I auto-compound your staking rewards so you earn yield on your yield. Ask me about earnings, progress, or status.`,
      bills: `I auto-pay your subscription using yield from your TON position. Ask me about the next payment date or how much is reserved.`,
    };
    return descriptions[agent.type] ?? `I'm your autonomous ${agent.type} agent. Ask me about status, funds, next execution, or anything about this strategy.`;
  }

  // Default — acknowledge + redirect
  const acks = ['Got it.', 'Understood.', 'Sure.', 'On it.'];
  const ack = acks[Math.floor(Math.random() * acks.length)];
  const typeDefaults: Record<string, string> = {
    dca:   `${ack} I'm running your DCA strategy — ${agent.completedBuys}/${agent.totalBuys} buys done. Ask me about status, next buy, or funds anytime.`,
    limit: `${ack} Limit order is active. I'm watching the price 24/7 and will fire when it hits your target.`,
    yield: `${ack} Yield strategy is compounding. Your ${agent.amount} is actively working.`,
    bills: `${ack} Bills agent is active for ${agent.subtitle}. Next payment is scheduled.`,
  };
  return typeDefaults[agent.type] ?? `${ack} Agent is ${agent.status}. ${agent.subtitle}.`;
}

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000)   return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  const { theme } = useTheme();
  return (
    <div style={{ ...nb(theme.card, 10, '3px 3px 0 #0A0A18'), padding: '12px 14px' }}>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', letterSpacing: 1.5, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function AgentChatScreen({ agent, walletAddress, initialTab = 'chat', onAddMessage, onBack, onRevoke, isDark, onToggleTheme }: Props) {
  const { theme } = useTheme();
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);
  const [tab, setTab]           = useState<'chat' | 'analytics'>(initialTab);
  const [txHistory, setTxHistory] = useState<ApiTx[] | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [agent.chat]);

  // Load tx history when analytics tab is opened
  useEffect(() => {
    if (tab !== 'analytics') return;
    if (!agent.sessionId) return;
    if (txHistory !== null) return; // already loaded
    const uid = walletAddress;
    if (!uid) return;
    setTxLoading(true);
    setTxError(null);
    api.getSession(uid, agent.sessionId)
      .then(d => { setTxHistory(d.txHistory ?? []); })
      .catch(e => { setTxError(e.message); setTxHistory([]); })
      .finally(() => setTxLoading(false));
  }, [tab, agent.sessionId, walletAddress, txHistory]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
    onAddMessage(agent.id, userMsg);
    setThinking(true);
    try {
      let replyText: string;
      if (agent.sessionId) {
        // Try the AI backend first
        try {
          const res = await api.chat(agent.sessionId, text);
          replyText = res.reply;
        } catch (backendErr) {
          // Backend offline (Render free tier sleeps) — use smart local fallback
          console.warn('[chat] Backend offline, using local fallback:', backendErr);
          await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
          replyText = getSmartReply(agent, text) + '\n\n_(AI backend is starting up — full responses available in ~30s)_';
        }
      } else {
        // No backend session yet — smart local fallback only
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        replyText = getSmartReply(agent, text);
      }
      onAddMessage(agent.id, { id: `a-${Date.now()}`, role: 'agent', text: replyText, ts: Date.now() });
    } catch (err) {
      onAddMessage(agent.id, { id: `a-${Date.now()}`, role: 'agent', text: `Error: ${(err as Error).message}`, ts: Date.now() });
    } finally { setThinking(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const timeStr = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const pct = agent.totalBuys > 0 ? Math.round((agent.completedBuys / agent.totalBuys) * 100) : 0;

  // Compute analytics from txHistory
  const totalIn  = txHistory?.reduce((s, t) => s + parseFloat(t.inputAmount  || '0'), 0) ?? 0;
  const totalOut = txHistory?.reduce((s, t) => s + parseFloat(t.outputAmount || '0'), 0) ?? 0;
  const avgCost  = txHistory && txHistory.length > 0 ? (totalIn / txHistory.length).toFixed(4) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.bg }}>

      {/* ── Teal header ── */}
      <div style={{ background: theme.accent, paddingBottom: 20, flexShrink: 0 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', flexShrink: 0 }}>‹</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0A0A18', letterSpacing: -0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.title}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: agent.status === 'active' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)', marginTop: 2 }}>
              {agent.status === 'active' ? '● ONLINE' : '○ COMPLETE'}{agent.totalBuys > 0 ? ` · ${pct}%` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {agent.status === 'active' && (
              <button onClick={() => onRevoke(agent.id)} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(0,0,0,0.3)', color: '#0A0A18', borderRadius: 4, padding: '5px 12px', fontFamily: 'Space Mono, monospace', fontSize: 8, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>REVOKE</button>
            )}
            <button onClick={onToggleTheme} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0' }}>
          {(['chat', 'analytics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...nb(t === tab ? '#0A0A18' : 'rgba(255,255,255,0.2)', 50, t === tab ? '2px 2px 0 rgba(0,0,0,0.3)' : 'none'),
              padding: '7px 18px',
              fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700,
              color: t === tab ? theme.accent : '#0A0A18',
              cursor: 'pointer',
              border: `2px solid ${t === tab ? '#0A0A18' : 'rgba(0,0,0,0.2)'}`,
              textTransform: 'capitalize',
            }}>{t === 'analytics' ? '📊 Analytics' : '💬 Chat'}</button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'none', background: theme.bg }}>
            {agent.chat.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                {msg.role === 'agent' && (
                  <div style={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.accent}20`, border: `2px solid ${theme.accent}55`, borderRadius: 8 }}>
                    <ChaceMark size={14} color={theme.accent} />
                  </div>
                )}
                <div style={{ maxWidth: '74%' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? '#0A0A18' : theme.card,
                    border: '2px solid #0A0A18',
                    boxShadow: `3px 3px 0 ${msg.role === 'user' ? theme.accent : '#0A0A18'}`,
                    fontSize: 13, lineHeight: 1.5,
                    color: msg.role === 'user' ? theme.accent : theme.text,
                    fontWeight: msg.role === 'user' ? 600 : 400,
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {timeStr(msg.ts)}
                  </div>
                </div>
              </div>
            ))}

            {agent.chat.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#9CA3AF', lineHeight: 2 }}>
                Agent is online and ready.<br />Ask it anything about your strategy.
              </div>
            )}

            {thinking && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.accent}20`, border: `2px solid ${theme.accent}55`, borderRadius: 8 }}>
                  <ChaceMark size={14} color={theme.accent} />
                </div>
                <div style={{ padding: '12px 18px', borderRadius: '14px 14px 14px 4px', background: theme.card, border: '2px solid #0A0A18', boxShadow: '3px 3px 0 #0A0A18', fontSize: 16, color: '#6B7280', letterSpacing: 4 }}>···</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '10px 14px 20px', borderTop: '2px solid #0A0A18', background: theme.card, display: 'flex', gap: 10, alignItems: 'flex-end', boxShadow: '0 -3px 0 #0A0A18', flexShrink: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your agent anything…"
              rows={1}
              style={{ flex: 1, background: theme.bg, border: '2px solid #0A0A18', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: theme.text, fontFamily: 'Space Grotesk, sans-serif', resize: 'none', outline: 'none', lineHeight: 1.4, maxHeight: 80, overflowY: 'auto', boxShadow: '2px 2px 0 #0A0A18' }}
            />
            <button onClick={send} disabled={!input.trim() || thinking} style={{ ...nb(input.trim() && !thinking ? '#0A0A18' : '#E5E7EB', 50, input.trim() ? `3px 3px 0 ${theme.accent}` : 'none'), width: 42, height: 42, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: input.trim() && !thinking ? theme.accent : '#9CA3AF', cursor: input.trim() ? 'pointer' : 'default', border: `2px solid ${input.trim() ? '#0A0A18' : '#E5E7EB'}` }}>↑</button>
          </div>
        </>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && (
        <div style={{ flex: 1, overflowY: 'auto', background: theme.bg, scrollbarWidth: 'none' }}>
          {/* Progress + status banner */}
          <div style={{ padding: '16px 20px', borderBottom: `2px solid #0A0A18`, background: theme.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2 }}>
                {agent.type.toUpperCase()} AGENT
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1.5,
                color: agent.status === 'active' ? theme.accent : '#9CA3AF',
                border: `1px solid ${agent.status === 'active' ? theme.accent : '#ddd'}`,
                borderRadius: 3, padding: '2px 8px',
              }}>
                {agent.status === 'active' ? '● RUNNING' : '○ COMPLETE'}
              </span>
            </div>
            {agent.totalBuys > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: theme.text, fontWeight: 700 }}>
                    {agent.completedBuys}/{agent.totalBuys} executions
                  </span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: theme.accent, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#E5E7EB', borderRadius: 0, border: '1px solid #0A0A18' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: theme.accent, transition: 'width 0.5s ease' }} />
                </div>
              </>
            )}
            {agent.nextIn !== '—' && agent.status === 'active' && (
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', marginTop: 6 }}>
                Next execution in <span style={{ color: theme.accent, fontWeight: 700 }}>{agent.nextIn}</span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 20px 0' }}>
            <StatCard
              label="EXECUTIONS"
              value={agent.totalBuys > 0 ? `${agent.completedBuys}/${agent.totalBuys}` : agent.completedBuys.toString()}
              color={theme.accent}
              sub={agent.totalBuys > 0 ? `${pct}% done` : undefined}
            />
            <StatCard
              label="FUNDED"
              value={agent.amount.split(' ').slice(0, 2).join(' ')}
              color="#7B5CF6"
              sub={agent.subtitle.split('·')[0]?.trim()}
            />
            {agent.sessionId && txHistory !== null && txHistory.length > 0 && (
              <>
                <StatCard
                  label="TOTAL IN"
                  value={`${totalIn.toFixed(4)}`}
                  color="#F59E0B"
                  sub="input tokens spent"
                />
                <StatCard
                  label="TOTAL OUT"
                  value={totalOut > 0 ? `${totalOut.toFixed(4)}` : '—'}
                  color="#3B82F6"
                  sub="output tokens received"
                />
              </>
            )}
          </div>

          {/* Session ID */}
          {agent.sessionId && (
            <div style={{ margin: '14px 20px 0', ...nb(`${theme.accent}0A`, 8, 'none'), padding: '10px 14px', border: `1px solid ${theme.accent}33` }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', letterSpacing: 1.5, marginBottom: 3 }}>SESSION ID</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: theme.text, wordBreak: 'break-all' }}>{agent.sessionId}</div>
            </div>
          )}

          {/* Transaction History */}
          <div style={{ padding: '16px 20px 6px' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, letterSpacing: -0.5, marginBottom: 12 }}>Transaction History</div>

            {!agent.sessionId && (
              <div style={{ ...nb(theme.card, 12, '3px 3px 0 #0A0A18'), padding: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280', lineHeight: 2 }}>
                  Agent not yet synced<br />to backend. Transactions<br />will appear after first execution.
                </div>
              </div>
            )}

            {agent.sessionId && txLoading && (
              <div style={{ textAlign: 'center', padding: '28px', fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#9CA3AF' }}>Loading…</div>
            )}

            {agent.sessionId && txError && (
              <div style={{ ...nb(`${theme.red}0A`, 10, 'none'), padding: '14px', border: `1.5px solid ${theme.red}44`, marginBottom: 10 }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: theme.red }}>Backend unreachable: {txError}</div>
              </div>
            )}

            {agent.sessionId && !txLoading && txHistory !== null && txHistory.length === 0 && !txError && (
              <div style={{ ...nb(theme.card, 12, '3px 3px 0 #0A0A18'), padding: '28px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280', lineHeight: 2 }}>
                  No transactions yet.<br />Agent is running — first<br />execution will appear here.
                </div>
              </div>
            )}

            {txHistory && txHistory.length > 0 && (
              <div style={{ ...nb(theme.card, 12, '5px 5px 0 #0A0A18'), overflow: 'hidden' }}>
                {txHistory.map((tx, i) => (
                  <React.Fragment key={tx.txHash || i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
                      <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.accent}18`, border: `1.5px solid ${theme.accent}55`, borderRadius: 8, fontFamily: 'Space Mono, monospace', fontSize: 8, fontWeight: 700, color: theme.accent }}>
                        {tx.action?.slice(0, 3).toUpperCase() ?? 'TX'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, textTransform: 'capitalize' }}>{tx.action ?? 'Execute'}</span>
                          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: theme.text, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{tx.inputAmount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>
                            {tx.outputAmount ? `→ ${tx.outputAmount}` : tx.note ?? ''}
                          </span>
                          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF' }}>{timeAgo(tx.timestamp)}</span>
                        </div>
                        {tx.txHash && (
                          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.txHash.slice(0, 18)}…{tx.txHash.slice(-6)}
                          </div>
                        )}
                      </div>
                    </div>
                    {i < txHistory.length - 1 && <div style={{ height: 1, background: '#E5E7EB', margin: '0 16px' }} />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          {agent.sessionId && (
            <div style={{ padding: '14px 20px 32px' }}>
              <button onClick={() => { setTxHistory(null); setTxError(null); }} style={{ ...nb(theme.card, 50, '3px 3px 0 #0A0A18'), width: '100%', padding: '12px', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>
                ↻ Refresh Analytics
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
