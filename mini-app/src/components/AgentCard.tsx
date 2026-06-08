import React from "react";
import type { Agent } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  agent: Agent;
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
}

export default function AgentCard({ agent, onRevoke, onChat }: Props) {
  const { theme } = useTheme();
  const pct = agent.totalBuys > 0 ? (agent.completedBuys / agent.totalBuys) * 100 : 0;
  const isLimit = agent.type === 'limit';
  const isDone  = agent.status === 'complete';

  return (
    <div
      onClick={() => onChat(agent.id)}
      style={{
        background: theme.card,
        border: `1.5px solid ${theme.bdr}`,
        borderLeft: `3px solid ${isDone ? theme.dim : theme.accent}`,
        borderRadius: 8, padding: '14px 14px 12px',
        cursor: 'pointer',
        opacity: isDone ? 0.65 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{agent.title}</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }}>{agent.subtitle}</div>
        </div>
        <span style={{
          background: `${isDone ? theme.dim : theme.accent}22`,
          border: `1px solid ${isDone ? theme.dim : theme.accent}55`,
          borderRadius: 3, padding: '3px 8px',
          fontFamily: 'Space Mono,monospace', fontSize: 9,
          color: isDone ? theme.sub : theme.accent, letterSpacing: 1,
        }}>
          {isDone ? 'DONE' : isLimit ? 'WATCHING' : 'RUNNING'}
        </span>
      </div>

      {!isLimit && agent.totalBuys > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 3, background: theme.dim, borderRadius: 1 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: theme.accent, borderRadius: 1 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }}>
              {agent.completedBuys}/{agent.totalBuys} buys done
            </span>
            <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }}>
              Next: {agent.nextIn}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }}>
          {agent.amount}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }}>TAP TO CHAT →</span>
          {!isDone && (
            <button
              onClick={e => { e.stopPropagation(); onRevoke(agent.id); }}
              style={{
                background: 'transparent', border: `1.5px solid ${theme.red}`, color: theme.red,
                padding: '4px 10px', fontFamily: 'Space Mono,monospace',
                fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', borderRadius: 3,
              }}
            >REVOKE</button>
          )}
        </div>
      </div>
    </div>
  );
}
