import React from "react";
import { useTheme } from "../ThemeContext";
import { MOCK_ACTIVITY } from "../mockData";

interface Props {}

export default function ActivityScreen({}: Props) {
  const { theme } = useTheme();
  const txs = MOCK_ACTIVITY;

  const col: Record<string, string> = {
    done:    theme.accent,
    pending: '#D4930A',
    revoked: theme.red,
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 14 }}>
        RECENT ACTIVITY
      </div>
      {txs.map((tx, i) => (
        <React.Fragment key={tx.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: `${col[tx.status]}15`,
              border: `1.5px solid ${col[tx.status]}44`,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Mono,monospace', fontSize: 8,
              color: col[tx.status], fontWeight: 700,
            }}>{tx.label}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{tx.type}</span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.text, fontWeight: 700 }}>{tx.amt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }}>{tx.pair}</span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }}>{tx.time}</span>
              </div>
            </div>
          </div>
          {i < txs.length - 1 && <div style={{ height: 1, background: theme.bdr }} />}
        </React.Fragment>
      ))}
    </div>
  );
}
