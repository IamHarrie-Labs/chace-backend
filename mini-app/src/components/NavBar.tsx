import React from "react";
import type { Screen } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  screen: Screen;
  onNav: (id: Screen) => void;
  agentCount: number;
}

/* SVG icons */
const IcoHome = ({ c = '#fff', s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);
const IcoPlus = ({ c = '#fff', s = 24 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoBell = ({ c = '#fff', s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IcoList = ({ c = '#fff', s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="15" y2="18" />
  </svg>
);

const TABS = [
  { id: 'home'       as Screen, Icon: IcoHome,  label: 'Home'   },
  { id: 'new'        as Screen, Icon: IcoPlus,  label: '',   big: true },
  { id: 'strategies' as Screen, Icon: IcoBell,  label: 'Agents' },
  { id: 'activity'   as Screen, Icon: IcoList,  label: 'Log'    },
];

export default function NavBar({ screen, onNav, agentCount }: Props) {
  const { theme } = useTheme();
  const DARK = '#0A0A18';

  return (
    /* Floating dark pill centered at bottom */
    <div style={{
      position: 'absolute', bottom: 24,
      left: '50%', transform: 'translateX(-50%)',
      zIndex: 60,
    }}>
      <div style={{
        background: DARK,
        border: `2px solid ${DARK}`,
        boxShadow: `5px 5px 0 ${DARK}`,
        borderRadius: 50,
        padding: '8px 8px',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {TABS.map(({ id, Icon, label, big }) => {
          const active = screen === id || (id === 'strategies' && screen === 'chat');
          const badge  = id === 'strategies' ? agentCount : 0;
          return big ? (
            <button key={id} onClick={() => onNav(id)} style={{
              background: active ? theme.accent : `${theme.accent}22`,
              border: `2px solid ${active ? theme.accent : `${theme.accent}66`}`,
              boxShadow: active ? `3px 3px 0 ${theme.accent}66` : 'none',
              borderRadius: 50,
              width: 52, height: 52,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Icon c={active ? DARK : theme.accent} s={24} />
            </button>
          ) : (
            <button key={id} onClick={() => onNav(id)} style={{
              background: active ? `${theme.accent}18` : 'transparent',
              border: 'none', cursor: 'pointer',
              width: 60, height: 48,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              borderRadius: 14, position: 'relative',
            }}>
              <Icon c={active ? theme.accent : '#4B5563'} s={21} />
              <span style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 7.5, color: active ? theme.accent : '#4B5563',
                letterSpacing: 0.5,
              }}>{label}</span>
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 8,
                  width: 16, height: 16, borderRadius: '50%',
                  background: theme.accent, color: DARK,
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${DARK}`,
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
