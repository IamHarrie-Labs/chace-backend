import React, { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { api, type ApiSession } from "../api";
import { MOCK_ACTIVITY } from "../mockData";

export default function ActivityScreen() {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<ApiSession[] | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getSessions("12345")
      .then(r => { setSessions(r.sessions); setLoading(false); })
      .catch(() => { setSessions(null); setLoading(false); });
  }, []);

  const statusColor: Record<string, string> = {
    active:    theme.accent,
    completed: '#22C55E',
    revoked:   theme.red,
    pending:   '#F59E0B',
  };

  const typeIcon: Record<string, string> = {
    dca: '⟳', swap: '⇄', limit: '⊙', yield: '◈', bills: '◎',
  };

  const showSessions = sessions && sessions.length > 0;

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Title */}
      <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 16, padding: '4px 4px 0' }}>
        Activity
      </div>

      {loading && (
        <div style={{
          textAlign: 'center', padding: 40,
          background: theme.card, borderRadius: 16,
          fontSize: 14, color: theme.sub,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          Loading…
        </div>
      )}

      {!loading && (
        <div style={{ background: theme.card, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {showSessions ? sessions.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: `${statusColor[s.status] ?? theme.sub}15`,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: statusColor[s.status] ?? theme.sub,
                }}>{typeIcon[s.action] ?? '•'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                      {s.action.toUpperCase()} · {s.fromToken} → {s.toToken}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                      {s.totalAmount} {s.fromToken}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: statusColor[s.status] ?? theme.sub,
                      background: `${statusColor[s.status] ?? theme.sub}15`,
                      borderRadius: 20, padding: '2px 8px',
                    }}>
                      {s.status}{s.action === 'dca' ? ` · ${s.swapsCompleted}/${s.swapsTotal}` : ''}
                    </span>
                    <span style={{ fontSize: 11, color: theme.sub }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {i < sessions.length - 1 && <div style={{ height: 1, background: theme.bdr, margin: '0 16px' }} />}
            </React.Fragment>
          )) : MOCK_ACTIVITY.map((tx, i) => {
            const c = tx.status === 'done' ? theme.accent : tx.status === 'revoked' ? theme.red : '#F59E0B';
            return (
              <React.Fragment key={tx.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                  <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: `${c}15`, borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: c,
                  }}>{tx.label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{tx.type}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{tx.amt}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: theme.sub }}>{tx.pair}</span>
                      <span style={{ fontSize: 11, color: theme.sub }}>{tx.time}</span>
                    </div>
                  </div>
                </div>
                {i < MOCK_ACTIVITY.length - 1 && <div style={{ height: 1, background: theme.bdr, margin: '0 16px' }} />}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
