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

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      ts: Date.now(),
    };
    onAddMessage(agent.id, userMsg);
    setThinking(true);

    try {
      let replyText: string;
      if (agent.sessionId) {
        const res = await api.chat(agent.sessionId, text);
        replyText = res.reply;
      } else {
        // Fallback mock for seed agents without a real session
        await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
        replyText = getAgentReply(agent);
      }
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: replyText,
        ts: Date.now(),
      };
      onAddMessage(agent.id, agentMsg);
    } catch (err) {
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: `Something went wrong: ${(err as Error).message}`,
        ts: Date.now(),
      };
      onAddMessage(agent.id, agentMsg);
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
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: theme.bg,
    }}>
      {/* Agent info strip */}
      <div style={{
        padding: '10px 16px 12px',
        borderBottom: `1px solid ${theme.bdr}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${theme.accent}18`,
          border: `1.5px solid ${theme.accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Mono,monospace', fontSize: 10,
          color: theme.accent, fontWeight: 700,
        }}>
          {agent.type === 'dca' ? '⟳' : agent.type === 'limit' ? '⊙' : '◈'}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{agent.title}</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }}>
            {agent.status === 'active' ? '● online' : '○ complete'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12,
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
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: `${theme.accent}20`,
                border: `1.5px solid ${theme.accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: theme.accent,
              }}>C</div>
            )}
            <div style={{ maxWidth: '72%' }}>
              <div style={{
                padding: '10px 13px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? theme.accent : theme.card,
                border: `1.5px solid ${msg.role === 'user' ? theme.accent : theme.bdr}`,
                fontSize: 13, lineHeight: 1.5,
                color: msg.role === 'user' ? '#fff' : theme.text,
                fontWeight: msg.role === 'user' ? 600 : 400,
              }}>
                {msg.text}
              </div>
              <div style={{
                fontFamily: 'Space Mono,monospace', fontSize: 9,
                color: theme.sub, marginTop: 3,
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}>
                {timeStr(msg.ts)}
              </div>
            </div>
          </div>
        ))}

        {thinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: `${theme.accent}20`,
              border: `1.5px solid ${theme.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: theme.accent,
            }}>C</div>
            <div style={{
              padding: '10px 16px',
              borderRadius: '14px 14px 14px 4px',
              background: theme.card, border: `1.5px solid ${theme.bdr}`,
              fontFamily: 'Space Mono,monospace', fontSize: 13,
              color: theme.sub, letterSpacing: 3,
            }}>···</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px 16px',
        borderTop: `1px solid ${theme.bdr}`,
        background: theme.surf,
        display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your agent anything…"
          rows={1}
          style={{
            flex: 1, background: theme.card,
            border: `1.5px solid ${theme.bdr}`,
            borderRadius: 10, padding: '10px 12px',
            fontSize: 13, color: theme.text,
            fontFamily: 'Space Grotesk,sans-serif',
            resize: 'none', outline: 'none',
            lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || thinking}
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: input.trim() && !thinking ? theme.accent : theme.dim,
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, color: '#fff',
            transition: 'background 0.15s',
          }}
        >↑</button>
      </div>
    </div>
  );
}
