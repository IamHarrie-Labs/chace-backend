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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <BalanceCard />

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 10 }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <QuickBtn label="DCA"   icon="⟳" onClick={() => onNew('dca')} />
          <QuickBtn label="LIMIT" icon="⊙" onClick={() => onNew('limit')} />
          <QuickBtn label="YIELD" icon="◈" onClick={() => onNew('yield')} />
          <QuickBtn label="SWAP"  icon="⇄" onClick={() => onNew('swap')} />
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2 }}>
            ACTIVE AGENTS ({active.length})
          </span>
          <button onClick={onViewAll} style={{
            background: 'none', border: 'none',
            fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.accent, cursor: 'pointer',
          }}>SEE ALL →</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.map(a => (
            <AgentCard key={a.id} agent={a} onRevoke={onRevoke} onChat={onChat} />
          ))}
          {active.length === 0 && (
            <div style={{
              background: theme.card, border: `2px dashed ${theme.bdr}`,
              borderRadius: 8, padding: '32px 16px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub, marginBottom: 12 }}>
                NO ACTIVE AGENTS
              </div>
              <button onClick={() => onNew('dca')} style={{
                background: theme.accent, border: `2px solid ${theme.accent}`,
                color: '#fff', padding: '10px 20px',
                fontFamily: 'Space Grotesk,sans-serif', fontSize: 13,
                fontWeight: 800, cursor: 'pointer', borderRadius: 6,
              }}>CREATE FIRST AGENT →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
