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
  const pct     = agent.totalBuys > 0 ? (agent.completedBuys / agent.totalBuys) * 100 : 0;
  const isLimit = agent.type === 'limit';
  const isDone  = agent.status === 'complete';

  const nb: React.CSSProperties = {
    background: theme.card,
    border: `2px solid ${isDone ? '#ddd' : '#0A0A18'}`,
    boxShadow: isDone ? '2px 2px 0 rgba(0,0,0,0.1)' : '4px 4px 0 #0A0A18',
    borderRadius: 14,
    padding: '17px',
    opacity: isDone ? 0.6 : 1,
    cursor: 'pointer',
  };

  return (
    <div onClick={() => onChat(agent.id)} style={nb}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{agent.title}</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{agent.subtitle}</div>
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1.5, color: isDone ? '#9CA3AF' : theme.accent, border: `1px solid ${isDone ? '#ddd' : theme.accent}`, borderRadius: 3, padding: '3px 8px', whiteSpace: 'nowrap' }}>
          {isDone ? 'DONE' : isLimit ? 'WATCHING' : 'RUNNING'}
        </span>
      </div>

      {/* Progress */}
      {!isLimit && agent.totalBuys > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 3, background: '#E5E7EB' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: theme.accent }} />
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', marginTop: 4 }}>
            {agent.completedBuys}/{agent.totalBuys} executions · Next: {agent.nextIn}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: theme.text, fontWeight: 700 }}>{agent.amount}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>TAP TO CHAT →</span>
          {!isDone && (
            <button
              onClick={e => { e.stopPropagation(); onRevoke(agent.id); }}
              style={{ background: `${theme.red}10`, border: `1.5px solid ${theme.red}`, color: theme.red, padding: '6px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: 1, borderRadius: 4, boxShadow: '2px 2px 0 #8B0000' }}
            >REVOKE</button>
          )}
        </div>
      </div>
    </div>
  );
}
