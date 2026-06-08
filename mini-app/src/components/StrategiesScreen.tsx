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

      {/* Section title */}
      <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, padding: '4px 4px 4px' }}>
        Your Agents
      </div>

      {/* Pill filter tabs */}
      <div style={{
        display: 'flex', gap: 8,
        background: theme.card, borderRadius: 20,
        padding: 4, width: 'fit-content',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        {(['all', 'active', 'done'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? theme.accent : 'transparent',
            border: 'none',
            color: filter === f ? '#fff' : theme.sub,
            padding: '7px 18px',
            fontSize: 12, fontWeight: filter === f ? 700 : 500,
            cursor: 'pointer', borderRadius: 16,
            textTransform: 'capitalize',
            transition: 'background 0.15s, color 0.15s',
          }}>{f}</button>
        ))}
      </div>

      {/* Agent list */}
      {list.map(a => (
        <AgentCard key={a.id} agent={a} onRevoke={onRevoke} onChat={onChat} />
      ))}

      {list.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 16px',
          background: theme.card, borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: theme.sub }}>
            No agents in this filter
          </div>
        </div>
      )}
    </div>
  );
}
