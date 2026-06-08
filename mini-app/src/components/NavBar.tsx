import React from "react";
import type { Screen } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  screen: Screen;
  onNav: (id: Screen) => void;
  agentCount: number;
}

/* ── Icons with filled variants ── */
const IcoHome = ({ c = '#fff', s = 24, filled = false }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" stroke={c} fill={filled ? 'rgba(0,0,0,0.2)' : 'none'} />
  </svg>
);

const IcoPlus = ({ c = '#fff', s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IcoBell = ({ c = '#fff', s = 24, filled = false }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" />
  </svg>
);

/* ── Salmon nav color from design ── */
const NAV_COLOR = '#D96845';

export default function NavBar({ screen, onNav, agentCount }: Props) {
  const { theme } = useTheme();

  const homeActive      = screen === 'home';
  const agentsActive    = screen === 'strategies' || screen === 'chat';
  const newActive       = screen === 'new';

  return (
    <div style={{
      position: 'absolute', bottom: 26,
      left: '50%', transform: 'translateX(-50%)',
      zIndex: 60,
    }}>
      <div style={{
        background: NAV_COLOR,
        borderRadius: 60,
        padding: '10px 14px',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        border: '2.5px solid #0A0A18',
        boxShadow: '4px 4px 0 #0A0A18',
      }}>

        {/* ── Home ── */}
        <button
          onClick={() => onNav('home')}
          style={{
            width: 56, height: 46,
            background: homeActive ? 'rgba(255,255,255,0.22)' : 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 12, position: 'relative',
          }}
        >
          <IcoHome c="#fff" s={24} filled={homeActive} />
        </button>

        {/* ── New (center) ── */}
        <button
          onClick={() => onNav('new')}
          style={{
            width: 56, height: 46,
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.35)',
            borderRadius: 50, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <IcoPlus c="#fff" s={22} />
        </button>

        {/* ── Agents / Bell ── */}
        <button
          onClick={() => onNav('strategies')}
          style={{
            width: 56, height: 46,
            background: agentsActive ? 'rgba(255,255,255,0.22)' : 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 12, position: 'relative',
          }}
        >
          <IcoBell c="#fff" s={24} filled={agentsActive} />
          {agentCount > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 16, height: 16, borderRadius: '50%',
              background: theme.accent, color: '#0A0A18',
              fontFamily: 'Space Mono, monospace',
              fontSize: 8, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #0A0A18',
            }}>{agentCount}</span>
          )}
        </button>

      </div>
    </div>
  );
}
