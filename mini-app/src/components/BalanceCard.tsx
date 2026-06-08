import React, { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { api } from "../api";

export default function BalanceCard() {
  const { theme } = useTheme();
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("");

  useEffect(() => {
    api.health()
      .then(r => { setBalance(r.balance); setNetwork(r.network); })
      .catch(() => setBalance("—"));
  }, []);

  const tonNum = balance !== null ? parseFloat(balance) : NaN;
  const ton    = isFinite(tonNum) ? tonNum : null;
  const usd    = ton != null ? (ton * 4.87).toFixed(2) : "—";
  const disp   = ton != null ? ton.toFixed(2) : "—";

  return (
    <div style={{
      background: theme.card,
      border: `2px solid ${theme.accent}`,
      boxShadow: `4px 4px 0 ${theme.accent}44`,
      borderRadius: 8,
      padding: '20px 20px 16px',
      margin: '0 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, letterSpacing: 2 }}>
          MASTER WALLET
        </div>
        {network && (
          <div style={{
            fontFamily: 'Space Mono,monospace', fontSize: 8, letterSpacing: 1,
            color: network === 'mainnet' ? theme.accent : '#D4930A',
            background: network === 'mainnet' ? `${theme.accent}15` : '#D4930A15',
            border: `1px solid ${network === 'mainnet' ? theme.accent : '#D4930A'}44`,
            borderRadius: 4, padding: '2px 6px',
          }}>
            {network.toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: theme.text, lineHeight: 1 }}>
          {balance === null ? (
            <span style={{ fontSize: 20, color: theme.sub }}>loading…</span>
          ) : disp}
        </span>
        {balance !== null && <span style={{ fontSize: 17, fontWeight: 700, color: theme.accent }}>TON</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub }}>≈ ${usd} USD</span>
        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent }}>agent funds</span>
      </div>
      <div style={{ marginTop: 14, height: 2, background: theme.dim, borderRadius: 1 }}>
        <div style={{ width: ton != null && ton > 0 ? '100%' : '0%', height: '100%', background: theme.accent, borderRadius: 1, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}
