import React from "react";
import { useTheme } from "../ThemeContext";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RevokeModal({ onCancel, onConfirm }: Props) {
  const { theme } = useTheme();
  return (
    <div onClick={onCancel} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.card,
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px', width: '100%',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: theme.bdr, borderRadius: 4, margin: '0 auto 20px' }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: theme.red, letterSpacing: 0.5, marginBottom: 8 }}>
          Revoke Agent
        </div>
        <div style={{ fontSize: 18, color: theme.text, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
          Stop this agent and reclaim funds?
        </div>
        <div style={{ fontSize: 13, color: theme.sub, lineHeight: 1.7, marginBottom: 24 }}>
          Any unfilled orders will be cancelled.<br />
          Your tokens return immediately.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, background: theme.dim, border: 'none', color: theme.sub,
            padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 20,
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, background: theme.red, border: 'none', color: '#fff',
            padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 20,
            boxShadow: `0 4px 16px ${theme.red}44`,
          }}>Revoke</button>
        </div>
      </div>
    </div>
  );
}
