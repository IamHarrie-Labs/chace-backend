import React, { useState } from "react";
import { useTheme } from "../ThemeContext";

interface Props {
  label: string;
  icon: string;
  onClick: () => void;
}

export default function QuickBtn({ label, icon, onClick }: Props) {
  const { theme } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        background: hov ? `${theme.accent}14` : theme.card,
        border: `1.5px solid ${hov ? theme.accent : theme.bdr}`,
        color: hov ? theme.accent : theme.text,
        padding: '11px 4px 10px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 5, borderRadius: 6,
        transition: 'border-color 0.12s, background 0.12s, color 0.12s',
        fontFamily: 'Space Grotesk,sans-serif',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'Space Mono,monospace' }}>{label}</span>
    </button>
  );
}
