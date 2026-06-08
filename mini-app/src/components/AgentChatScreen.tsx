import React, { useState, useRef, useEffect } from "react";
import type { Agent, ChatMessage } from "../types";
import { useTheme } from "../ThemeContext";
import { api } from "../api";
import ChaceMark from "./ChaceMark";

interface Props {
  agent: Agent;
  onAddMessage: (agentId: number, msg: ChatMessage) => void;
  onBack: () => void;
  onRevoke: (id: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const AGENT_PERSONAS: Record<string, string[]> = {
  dca: [
    "Still running on schedule. Next buy coming up soon.",
    "DCA is the safest way to accumulate — I'm averaging your cost over time.",
    "I've executed {done} of {total} buys so far. Staying on track.",
  ],
  limit: [
    "Still watching. Price hasn't hit your target yet.",
    "Patience is the game here. I'll fire the moment the price dips.",
    "I'm monitoring 24/7 — no action needed from you.",
  ],
  yield: [
    "Compounding daily. Your yield is growing.",
    "Auto-compounding means you earn yield on your yield.",
    "Pool APY is healthy. Principal is safe.",
  ],
};

function getAgentReply(agent: Agent): string {
  const lines = AGENT_PERSONAS[agent.type] ?? AGENT_PERSONAS.dca;
  return lines[Math.floor(Math.random() * lines.length)]
    .replace('{done}', String(agent.completedBuys))
    .replace('{total}', String(agent.totalBuys));
}

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

export default function AgentChatScreen({ agent, onAddMessage, onBack, onRevoke, isDark, onToggleTheme }: Props) {
  const { theme } = useTheme();
  const [input, setInput]     = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [agent.chat]);

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
        const res = await api.chat(agent.sessionId, text);
        replyText = res.reply;
      } else {
        await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
        replyText = getAgentReply(agent);
      }
      onAddMessage(agent.id, { id: `a-${Date.now()}`, role: 'agent', text: replyText, ts: Date.now() });
    } catch (err) {
      onAddMessage(agent.id, { id: `a-${Date.now()}`, role: 'agent', text: `Something went wrong: ${(err as Error).message}`, ts: Date.now() });
    } finally { setThinking(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const timeStr = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.bg }}>

      {/* ── Teal header ── */}
      <div style={{ background: theme.accent, paddingBottom: 20, flexShrink: 0 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', flexShrink: 0 }}>‹</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0A0A18', letterSpacing: -0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.title}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: agent.status === 'active' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)', marginTop: 2 }}>
              {agent.status === 'active' ? '● ONLINE' : '○ COMPLETE'}
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
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'none', background: theme.bg }}>
        {agent.chat.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
            {msg.role === 'agent' && (
              <div style={{ ...nb(`${theme.accent}20`, 8, 'none'), width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.accent}55`, borderRadius: 8, boxShadow: 'none' }}>
                <ChaceMark size={14} color={theme.accent} />
              </div>
            )}
            <div style={{ maxWidth: '74%' }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? '#0A0A18' : theme.card,
                border: `2px solid ${msg.role === 'user' ? '#0A0A18' : '#0A0A18'}`,
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

        {thinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ ...nb(`${theme.accent}20`, 8, 'none'), width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.accent}55`, borderRadius: 8, boxShadow: 'none' }}>
              <ChaceMark size={14} color={theme.accent} />
            </div>
            <div style={{ padding: '12px 18px', borderRadius: '14px 14px 14px 4px', background: theme.card, border: '2px solid #0A0A18', boxShadow: '3px 3px 0 #0A0A18', fontSize: 16, color: '#6B7280', letterSpacing: 4 }}>···</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ padding: '10px 14px 20px', borderTop: `2px solid #0A0A18`, background: theme.card, display: 'flex', gap: 10, alignItems: 'flex-end', boxShadow: '0 -3px 0 #0A0A18', flexShrink: 0 }}>
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
    </div>
  );
}
