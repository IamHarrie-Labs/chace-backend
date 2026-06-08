import React from "react";
import type { Agent } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  agent: Agent;
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
}

const TYPE_ICONS: Record<string, string> = {
  dca: '⟳', limit: '⊙', yield: '◈', bills: '◎',
};

export default function AgentCard({ agent, onRevoke, onChat }: Props) {
  const { theme } = useTheme();
  const pct     = agent.totalBuys > 0 ? (agent.completedBuys / agent.totalBuys) * 100 : 0;
  const isLimit = agent.type === 'limit';
  const isDone  = agent.status === 'complete';

  return (
    <div
      onClick={() => onChat(agent.id)}
      style={{
        background: theme.card,
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        padding: '16px',
        cursor: 'pointer',
        opacity: isDone ? 0.6 : 1,
        transition: 'transform 0.12s, opacity 0.15s',
        border: isDone ? `1px solid ${theme.bdr}` : `1px solid ${theme.bdr}`,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Icon circle */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: isDone ? theme.dim : `${theme.accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: isDone ? theme.sub : theme.accent,
        }}>
          {TYPE_ICONS[agent.type] ?? '◉'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent.title}
          </div>
          <div style={{ fontSize: 11, color: theme.sub, fontWeight: 400 }}>{agent.subtitle}</div>
        </div>

        <span style={{
          background: isDone ? theme.dim : `${theme.accent}18`,
          borderRadius: 20, padding: '4px 10px',
          fontSize: 10, fontWeight: 700,
          color: isDone ? theme.sub : theme.accent,
          letterSpacing: 0.5, flexShrink: 0,
        }}>
          {isDone ? 'Done' : isLimit ? 'Watching' : 'Active'}
        </span>
      </div>

      {/* Progress */}
      {!isLimit && agent.totalBuys > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 4, background: theme.dim, borderRadius: 4 }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: theme.accent, borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: theme.sub, fontWeight: 500 }}>
              {agent.completedBuys}/{agent.totalBuys} buys done
            </span>
            <span style={{ fontSize: 10, color: theme.sub, fontWeight: 500 }}>
              Next: {agent.nextIn}
            </span>
          </div>
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>{agent.amount}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: theme.sub, fontWeight: 500 }}>Tap to chat →</span>
          {!isDone && (
            <button
              onClick={e => { e.stopPropagation(); onRevoke(agent.id); }}
              style={{
                background: 'transparent',
                border: `1.5px solid ${theme.red}`,
                color: theme.red,
                padding: '4px 12px',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                borderRadius: 20,
              }}
            >Revoke</button>
          )}
        </div>
      </div>
    </div>
  );
}
