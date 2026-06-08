import React, { useState } from "react";
import type { Agent } from "../types";
import { useTheme } from "../ThemeContext";
import AgentCard from "./AgentCard";

interface Props {
  agents: Agent[];
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
}

type Filter = 'all' | 'active' | 'done';

export default function StrategiesScreen({ agents, onRevoke, onChat }: Props) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const list = agents.filter(a =>
    filter === 'all'    ? true :
    filter === 'active' ? a.status !== 'complete' :
                          a.status === 'complete'
  );

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['all','active','done'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? `${theme.accent}18` : theme.card,
            border: `1.5px solid ${filter === f ? theme.accent : theme.bdr}`,
            color: filter === f ? theme.accent : theme.sub,
            padding: '7px 14px', fontFamily: 'Space Mono,monospace',
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            cursor: 'pointer', borderRadius: 4, textTransform: 'uppercase',
          }}>{f}</button>
        ))}
      </div>

      {list.map(a => (
        <AgentCard key={a.id} agent={a} onRevoke={onRevoke} onChat={onChat} />
      ))}

      {list.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px 16px',
          fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub,
        }}>
          NO AGENTS IN THIS FILTER
        </div>
      )}
    </div>
  );
}
