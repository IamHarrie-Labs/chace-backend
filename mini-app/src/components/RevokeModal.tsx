import React from "react";
import { useTheme } from "../ThemeContext";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RevokeModal({ onCancel, onConfirm }: Props) {
  const { theme } = useTheme();
  return (
    <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,24,0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{
        background: theme.card,
        borderRadius: '24px 24px 0 0',
        borderLeft: `3px solid ${theme.red}`,
        borderRight: `3px solid ${theme.red}`,
        borderTop: `3px solid ${theme.red}`,
        boxShadow: `0 -6px 0 ${theme.red}, -5px 0 0 #0A0A18, 5px 0 0 #0A0A18`,
        padding: '10px 22px 48px', width: '100%',
      }}>
        <div style={{ width: 40, height: 4, background: '#E5E7EB', margin: '10px auto 20px', borderRadius: 4 }} />
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.red, letterSpacing: 2, marginBottom: 12 }}>■ REVOKE AGENT</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 8, letterSpacing: -0.5 }}>Stop this agent?</div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', lineHeight: 1.8, marginBottom: 26 }}>
          Unfilled orders will be cancelled.<br />Your tokens return immediately.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ background: theme.card, border: '2px solid #0A0A18', boxShadow: '3px 3px 0 #0A0A18', borderRadius: 50, flex: 1, padding: '14px', color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: theme.red, border: '2px solid #8B0000', boxShadow: '4px 4px 0 #8B0000', borderRadius: 50, flex: 1, padding: '14px', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Revoke ■</button>
        </div>
      </div>
    </div>
  );
}
