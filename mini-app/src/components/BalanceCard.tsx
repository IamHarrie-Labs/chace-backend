import React, { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { api } from "../api";

interface Props {
  walletAddress: string;
}

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

export default function BalanceCard({ walletAddress }: Props) {
  const { theme } = useTheme();
  const [network, setNetwork] = useState<string>("");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Only check backend health (network/online status) — NOT the server wallet balance
  useEffect(() => {
    api.health()
      .then(r => { setNetwork(r.network); setBackendOnline(true); })
      .catch(() => { setBackendOnline(false); });
  }, []);

  const short = walletAddress
    ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
    : '';

  return (
    <div style={{ ...nb(theme.card, 16, '4px 4px 0 #0A0A18'), padding: '18px 20px 16px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2 }}>CONNECTED WALLET</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {network && (
            <div style={{ ...nb(`${theme.accent}22`, 8, 'none'), padding: '3px 10px', display: 'inline-block', border: `1px solid ${theme.accent}55`, boxShadow: 'none' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, color: theme.accent }}>{network.toUpperCase()}</span>
            </div>
          )}
          {backendOnline !== null && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: backendOnline ? theme.accent : theme.red, border: `1.5px solid #0A0A18`, flexShrink: 0 }} title={backendOnline ? 'Backend online' : 'Backend offline'} />
          )}
        </div>
      </div>

      {/* Wallet address */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, background: theme.accent, flexShrink: 0, borderRadius: 1, border: '1.5px solid #0A0A18' }} />
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: theme.text }}>{short}</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent, marginLeft: 'auto', letterSpacing: 1 }}>CONNECTED ✓</span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#E5E7EB', marginBottom: 12 }} />

      {/* Status rows */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF', marginBottom: 3 }}>BACKEND STATUS</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: backendOnline === null ? '#9CA3AF' : backendOnline ? theme.accent : theme.red }}>
            {backendOnline === null ? 'Checking…' : backendOnline ? 'Online ●' : 'Offline ○'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF', marginBottom: 3 }}>NETWORK</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: theme.text }}>
            {network ? network.toUpperCase() : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
