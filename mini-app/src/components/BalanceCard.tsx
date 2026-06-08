import React, { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { api } from "../api";

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

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
    <div style={{ ...nb(theme.card, 16, '4px 4px 0 #0A0A18'), padding: '18px 20px 16px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2 }}>AGENT WALLET</span>
        {network && (
          <div style={{ ...nb(`${theme.accent}22`, 8, '2px 2px 0 #0A0A18'), padding: '3px 10px', display: 'inline-block' }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: theme.accent }}>{network.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: theme.text, lineHeight: 1 }}>
              {balance === null ? <span style={{ fontSize: 20, color: '#6B7280', fontWeight: 500 }}>loading…</span> : disp}
            </span>
            {balance !== null && <span style={{ fontSize: 18, fontWeight: 700, color: theme.accent }}>TON</span>}
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', marginTop: 5 }}>≈ ${usd} USD</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...nb(`${theme.accent}22`, 8, '2px 2px 0 #0A0A18'), padding: '6px 12px', display: 'inline-block' }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: theme.accent }}>↑ 0.0%</span>
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>TODAY</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 12, height: 3, background: '#E5E7EB', borderRadius: 0 }}>
        <div style={{ width: ton != null && ton > 0 ? '62%' : '4%', height: '100%', background: theme.accent, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}
