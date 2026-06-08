import React from "react";
import type { Agent, AgentType } from "../types";
import { useTheme } from "../ThemeContext";
import BalanceCard from "./BalanceCard";
import QuickBtn from "./QuickBtn";
import AgentCard from "./AgentCard";

interface Props {
  agents: Agent[];
  onNew: (type: AgentType | 'swap') => void;
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
  onViewAll: () => void;
}

export default function HomeScreen({ agents, onNew, onRevoke, onChat, onViewAll }: Props) {
  const { theme } = useTheme();
  const active = agents.filter(a => a.status !== 'complete');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero greeting */}
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>
          Good day 👋
        </div>
        <div style={{ fontSize: 14, color: theme.sub, fontWeight: 400, marginTop: 4 }}>
          Your agents are working for you.
        </div>
      </div>

      <BalanceCard />

      {/* Quick actions */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, letterSpacing: 0.2, marginBottom: 12 }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickBtn label="DCA"   icon="⟳" onClick={() => onNew('dca')} />
          <QuickBtn label="Limit" icon="⊙" onClick={() => onNew('limit')} />
          <QuickBtn label="Yield" icon="◈" onClick={() => onNew('yield')} />
          <QuickBtn label="Swap"  icon="⇄" onClick={() => onNew('swap')} />
        </div>
      </div>

      {/* Active agents */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, letterSpacing: 0.2 }}>
            Active Agents
            <span style={{
              marginLeft: 8, background: theme.accent, color: '#fff',
              borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700,
            }}>{active.length}</span>
          </span>
          <button onClick={onViewAll} style={{
            background: 'none', border: 'none',
            fontSize: 13, fontWeight: 600, color: theme.accent, cursor: 'pointer',
          }}>See all →</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.map(a => (
            <AgentCard key={a.id} agent={a} onRevoke={onRevoke} onChat={onChat} />
          ))}
          {active.length === 0 && (
            <div style={{
              background: theme.card,
              border: `2px dashed ${theme.bdr}`,
              borderRadius: 16, padding: '36px 16px', textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
                No active agents
              </div>
              <div style={{ fontSize: 12, color: theme.sub, marginBottom: 16 }}>
                Launch your first autonomous DeFi agent
              </div>
              <button onClick={() => onNew('dca')} style={{
                background: theme.accent, border: 'none',
                color: '#fff', padding: '12px 24px',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 20,
                boxShadow: `0 4px 16px ${theme.accent}44`,
              }}>Create Agent →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
