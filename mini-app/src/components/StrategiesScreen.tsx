import React, { useState } from "react";
import type { Agent } from "../types";
import { useTheme } from "../ThemeContext";
import AgentCard from "./AgentCard";

interface Props {
  agents: Agent[];
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
  onBack: () => void;
}

type Filter = 'all' | 'active' | 'done';

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

export default function StrategiesScreen({ agents, onRevoke, onChat, onBack }: Props) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const list = agents.filter(a =>
    filter === 'all'    ? true :
    filter === 'active' ? a.status !== 'complete' :
                          a.status === 'complete'
  );

  return (
    <div>
      {/* ── Teal header ── */}
      <div style={{ background: theme.accent, paddingBottom: 44 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 5, fontSize: 20, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>‹</button>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: '#0A0A18', lineHeight: 1 }}>Agents</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: 2, marginTop: 5 }}>
              {agents.filter(a => a.status !== 'complete').length} ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* ── Cream body ── */}
      <div style={{ background: theme.bg, borderRadius: '26px 26px 0 0', marginTop: -26, paddingTop: 22 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 18 }}>
          {(['all', 'active', 'done'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...nb(f === filter ? '#0A0A18' : theme.card, 50, `3px 3px 0 #0A0A18`),
              padding: '9px 20px',
              color: f === filter ? '#fff' : '#6B7280',
              fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(a => (
            <AgentCard key={a.id} agent={a} onRevoke={onRevoke} onChat={onChat} />
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280' }}>
              No agents in this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
