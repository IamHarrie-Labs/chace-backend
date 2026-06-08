import React from "react";
import { useTheme } from "../ThemeContext";

interface Props {
  label: string;
  icon: string;
  onClick: () => void;
}

export default function QuickBtn({ label, icon, onClick }: Props) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: theme.card,
        border: '2px solid #0A0A18',
        boxShadow: '3px 3px 0 #0A0A18',
        borderRadius: 50,
        padding: '11px 4px 10px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 5,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'Space Mono, monospace' }}>{label}</span>
    </button>
  );
}
