import React from "react";
import { useTheme } from "../ThemeContext";

export default function BalanceCard() {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.card,
      border: `2px solid ${theme.accent}`,
      boxShadow: `4px 4px 0 ${theme.accent}44`,
      borderRadius: 8,
      padding: '20px 20px 16px',
      margin: '0 16px',
    }}>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, letterSpacing: 2, marginBottom: 8 }}>
        AGENT WALLET
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: theme.text, lineHeight: 1 }}>247.83</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: theme.accent }}>TON</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub }}>≈ $1,204.87 USD</span>
        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent }}>↑ +2.4% today</span>
      </div>
      <div style={{ marginTop: 14, height: 2, background: theme.dim, borderRadius: 1 }}>
        <div style={{ width: '62%', height: '100%', background: theme.accent, borderRadius: 1 }} />
      </div>
    </div>
  );
}
