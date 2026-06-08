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
      borderRadius: 20,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      padding: '24px 20px 20px',
      margin: '0 16px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.5 }}>
          Master Wallet
        </span>
        {network && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: network === 'mainnet' ? theme.accent : '#F59E0B',
            background: network === 'mainnet' ? `${theme.accent}15` : '#F59E0B18',
            borderRadius: 20, padding: '3px 10px',
          }}>
            {network.toUpperCase()}
          </span>
        )}
      </div>

      {/* Big balance */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, color: theme.text, lineHeight: 1 }}>
          {balance === null
            ? <span style={{ fontSize: 22, color: theme.sub, fontWeight: 500 }}>loading…</span>
            : disp}
        </span>
        {balance !== null && (
          <span style={{ fontSize: 20, fontWeight: 700, color: theme.accent }}>TON</span>
        )}
      </div>

      <div style={{ fontSize: 13, color: theme.sub, fontWeight: 500, marginBottom: 16 }}>
        ≈ ${usd} USD
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: theme.dim, borderRadius: 4 }}>
        <div style={{
          width: ton != null && ton > 0 ? '100%' : '4%',
          height: '100%', background: theme.accent, borderRadius: 4,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Agent Funds', val: disp + ' TON' },
          { label: 'Active Agents', val: '—' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: `${theme.accent}0D`,
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 10, color: theme.sub, fontWeight: 500, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.accent }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
