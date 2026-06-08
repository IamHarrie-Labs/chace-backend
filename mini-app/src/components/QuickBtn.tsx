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
        border: `1px solid ${theme.bdr}`,
        borderRadius: 16,
        padding: '14px 4px 12px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.12s, box-shadow 0.12s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: `${theme.accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: theme.accent,
      }}>{icon}</div>
      <span style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{label}</span>
    </button>
  );
}
