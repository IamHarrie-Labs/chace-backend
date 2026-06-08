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
      background: theme.surf,
      borderTop: `1.5px solid ${theme.bdr}`,
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
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
              alignItems: 'center', gap: 3, position: 'relative',
            }}
          >
            {tab.big ? (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: active ? theme.accent : theme.card,
                border: `2px solid ${active ? theme.accent : theme.bdr}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: active ? '#fff' : theme.sub,
                fontWeight: 800, marginTop: -8,
                boxShadow: active ? `0 0 0 4px ${theme.accent}22` : 'none',
                transition: 'all 0.15s',
              }}>+</div>
            ) : (
              <span style={{ fontSize: 20, lineHeight: 1, color: active ? theme.accent : theme.sub, position: 'relative' }}>
                {tab.icon}
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    background: theme.accent, color: '#fff',
                    borderRadius: '50%', width: 14, height: 14,
                    fontSize: 8, fontWeight: 800, fontFamily: 'Space Mono,monospace',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{badge}</span>
                )}
              </span>
            )}
            <span style={{
              fontFamily: 'Space Mono,monospace', fontSize: 8, letterSpacing: 0.5,
              color: active ? theme.accent : theme.sub,
              marginTop: tab.big ? 2 : 0,
            }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
