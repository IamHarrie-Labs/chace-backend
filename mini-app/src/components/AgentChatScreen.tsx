import React, { useState, useRef, useEffect } from "react";
import type { Agent, ChatMessage } from "../types";
import { useTheme } from "../ThemeContext";
import { api } from "../api";

interface Props {
  agent: Agent;
  onAddMessage: (agentId: number, msg: ChatMessage) => void;
}

const AGENT_PERSONAS: Record<string, string[]> = {
  dca: [
    "Still running on schedule. Next buy coming up soon.",
    "DCA is the safest way to accumulate — I'm averaging your cost over time.",
    "I've executed {done} of {total} buys so far. Staying on track.",
    "Dollar-cost averaging removes emotion from buying. I handle the discipline.",
  ],
  limit: [
    "Still watching. Price hasn't hit your target yet.",
    "Patience is the game here. I'll fire the moment the price dips to your target.",
    "Current price is above your limit. I'm monitoring 24/7.",
    "The moment it crosses your threshold, I execute immediately — no delay.",
  ],
  yield: [
    "Compounding daily. Your yield is growing.",
    "Auto-compounding means you earn yield on your yield. Exponential over time.",
    "Pool APY is healthy. Principal is safe.",
    "I reinvest every harvest automatically. No action needed from you.",
  ],
};

function getAgentReply(agent: Agent): string {
  const lines = AGENT_PERSONAS[agent.type] ?? AGENT_PERSONAS.dca;
  const random = lines[Math.floor(Math.random() * lines.length)];
  return random
    .replace('{done}', String(agent.completedBuys))
    .replace('{total}', String(agent.totalBuys));
}

export default function AgentChatScreen({ agent, onAddMessage }: Props) {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent.chat]);

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
    } finally {
      setThinking(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const timeStr = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg }}>

      {/* Agent info strip */}
      <div style={{
        padding: '12px 16px 14px',
        borderBottom: `1px solid ${theme.bdr}`,
        background: theme.card,
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14,
          background: `${theme.accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: theme.accent,
        }}>
          {agent.type === 'dca' ? '⟳' : agent.type === 'limit' ? '⊙' : agent.type === 'bills' ? '◎' : '◈'}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{agent.title}</div>
          <div style={{ fontSize: 11, color: agent.status === 'active' ? '#22C55E' : theme.sub, fontWeight: 500, marginTop: 1 }}>
            {agent.status === 'active' ? '● Online' : '○ Complete'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 14,
        scrollbarWidth: 'none',
      }}>
        {agent.chat.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 8, alignItems: 'flex-end',
          }}>
            {msg.role === 'agent' && (
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                background: `${theme.accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: theme.accent,
              }}>C</div>
            )}
            <div style={{ maxWidth: '74%' }}>
              <div style={{
                padding: '11px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                background: msg.role === 'user' ? theme.accent : theme.card,
                boxShadow: msg.role === 'agent' ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                fontSize: 14, lineHeight: 1.5,
                color: msg.role === 'user' ? '#fff' : theme.text,
                fontWeight: msg.role === 'user' ? 500 : 400,
              }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: 10, color: theme.sub, marginTop: 4,
                textAlign: msg.role === 'user' ? 'right' : 'left',
                fontWeight: 400,
              }}>
                {timeStr(msg.ts)}
              </div>
            </div>
          </div>
        ))}

        {thinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: `${theme.accent}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: theme.accent,
            }}>C</div>
            <div style={{
              padding: '12px 18px',
              borderRadius: '18px 18px 18px 6px',
              background: theme.card,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              fontSize: 16, color: theme.sub, letterSpacing: 4,
            }}>···</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px 16px',
        borderTop: `1px solid ${theme.bdr}`,
        background: theme.card,
        display: 'flex', gap: 10, alignItems: 'flex-end',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your agent anything…"
          rows={1}
          style={{
            flex: 1, background: theme.bg,
            border: `1.5px solid ${theme.bdr}`,
            borderRadius: 20, padding: '11px 16px',
            fontSize: 14, color: theme.text,
            fontFamily: 'Inter, sans-serif',
            resize: 'none', outline: 'none',
            lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || thinking}
          style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: input.trim() && !thinking ? theme.accent : theme.dim,
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#fff',
            boxShadow: input.trim() && !thinking ? `0 4px 12px ${theme.accent}44` : 'none',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
        >↑</button>
      </div>
    </div>
  );
}
