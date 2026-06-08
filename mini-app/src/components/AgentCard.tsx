import React from "react";
import type { Agent } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  agent: Agent;
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
  onAnalytics?: (id: number) => void;
}

function timeAgo(ts?: number): string {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 60_000)   return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

export default function AgentCard({ agent, onRevoke, onChat, onAnalytics }: Props) {
  const { theme } = useTheme();
  const pct     = agent.totalBuys > 0 ? (agent.completedBuys / agent.totalBuys) * 100 : 0;
  const isLimit = agent.type === 'limit';
  const isYield = agent.type === 'yield';
  const isBills = agent.type === 'bills';
  const isDone  = agent.status === 'complete';

  const lastMsg = agent.chat.length > 0 ? agent.chat[agent.chat.length - 1] : null;

  const statusColor = isDone ? '#9CA3AF' : theme.accent;
  const statusLabel = isDone ? 'DONE' : isLimit ? 'WATCHING' : isYield ? 'YIELDING' : isBills ? 'ACTIVE' : 'RUNNING';

  const typeColor: Record<string, string> = {
    dca:   theme.accent,
    limit: '#7B5CF6',
    yield: '#F59E0B',
    bills: '#3B82F6',
  };

  return (
    <div style={{
      background: theme.card,
      border: `2px solid ${isDone ? '#ddd' : '#0A0A18'}`,
      boxShadow: isDone ? '2px 2px 0 rgba(0,0,0,0.1)' : '4px 4px 0 #0A0A18',
      borderRadius: 14,
      overflow: 'hidden',
      opacity: isDone ? 0.7 : 1,
    }}>
      {/* ── Main clickable area (goes to chat) ── */}
      <div onClick={() => onChat(agent.id)} style={{ padding: '16px 16px 12px', cursor: 'pointer' }}>
        {/* Top row: title + badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.title}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{agent.subtitle}</div>
          </div>
          <span style={{
            fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1.5,
            color: statusColor,
            border: `1px solid ${isDone ? '#ddd' : statusColor}`,
            borderRadius: 3, padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{statusLabel}</span>
        </div>

        {/* Progress bar for DCA */}
        {!isLimit && !isYield && !isBills && agent.totalBuys > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ height: 4, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: theme.accent, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>
                {agent.completedBuys}/{agent.totalBuys} buys · {Math.round(pct)}%
              </span>
              {agent.status === 'active' && agent.nextIn !== '—' && (
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent, fontWeight: 700 }}>
                  Next: {agent.nextIn}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Amount row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: typeColor[agent.type] ?? theme.accent, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: theme.text }}>{agent.amount}</span>
          </div>
          {lastMsg && (
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF' }}>
              msg {timeAgo(lastMsg.ts)}
            </span>
          )}
        </div>
      </div>

      {/* ── Analytics strip ── */}
      <div style={{ borderTop: `1px solid ${isDone ? '#E5E7EB' : '#0A0A18'}`, display: 'flex', background: isDone ? '#F9FAFB' : `${theme.accent}08` }}>
        <button
          onClick={() => onAnalytics ? onAnalytics(agent.id) : onChat(agent.id)}
          style={{ flex: 1, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'transparent', border: 'none', borderRight: `1px solid ${isDone ? '#E5E7EB' : '#0A0A18'}` }}
        >
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: isDone ? '#9CA3AF' : theme.accent }}>📊</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: isDone ? '#9CA3AF' : theme.text }}>Analytics</span>
        </button>
        <button
          onClick={() => onChat(agent.id)}
          style={{ flex: 1, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'transparent', border: 'none', borderRight: !isDone ? `1px solid #0A0A18` : 'none' }}
        >
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: '#6B7280' }}>💬</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: '#6B7280' }}>Chat</span>
        </button>
        {!isDone && (
          <button
            onClick={e => { e.stopPropagation(); onRevoke(agent.id); }}
            style={{ flex: 1, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: theme.red }}>✕</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: theme.red }}>Revoke</span>
          </button>
        )}
      </div>
    </div>
  );
}
