import React from "react";
import type { Screen } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  screen: Screen;
  onNav: (id: Screen) => void;
  agentCount: number;
}

const TABS = [
  { id: 'home'       as Screen, label: 'Home',    icon: '⌂' },
  { id: 'new'        as Screen, label: 'New',     icon: '+', big: true },
  { id: 'strategies' as Screen, label: 'Agents',  icon: '◉' },
  { id: 'activity'   as Screen, label: 'Activity',icon: '≡' },
];

export default function NavBar({ screen, onNav, agentCount }: Props) {
  const { theme } = useTheme();

  return (
    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: theme.card,
      borderTop: `1px solid ${theme.bdr}`,
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    }}>
      {TABS.map(tab => {
        const active = screen === tab.id || (tab.id === 'strategies' && screen === 'chat');
        const badge  = tab.id === 'strategies' ? agentCount : 0;
        return (
          <button
            key={tab.id}
            onClick={() => onNav(tab.id)}
            style={{
              flex: 1, background: 'none', border: 'none',
              cursor: 'pointer', padding: '10px 4px 6px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, position: 'relative',
            }}
          >
            {tab.big ? (
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: theme.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, color: '#fff', fontWeight: 700, marginTop: -12,
                boxShadow: `0 4px 16px ${theme.accent}55`,
                transition: 'transform 0.15s',
              }}>+</div>
            ) : (
              <div style={{
                width: 36, height: 28, borderRadius: 20,
                background: active ? `${theme.accent}18` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: 18, lineHeight: 1, color: active ? theme.accent : theme.sub }}>
                  {tab.icon}
                </span>
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 2,
                    background: theme.accent, color: '#fff',
                    borderRadius: '50%', width: 14, height: 14,
                    fontSize: 8, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{badge}</span>
                )}
              </div>
            )}
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? theme.accent : theme.sub,
              letterSpacing: 0.2,
            }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
