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

  const col: Record<string, string> = {
    active:    theme.accent,
    completed: theme.sub,
    revoked:   theme.red,
    pending:   '#D4930A',
  };

  const icon: Record<string, string> = {
    dca:   '⟳',
    swap:  '⇄',
    limit: '⊙',
    yield: '◈',
    bills: '⚡',
  };

  const showSessions = sessions && sessions.length > 0;

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 14 }}>
        {showSessions ? `${sessions.length} AGENT SESSIONS` : 'RECENT ACTIVITY'}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 32, fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub }}>
          loading…
        </div>
      )}

      {!loading && showSessions && sessions.map((s, i) => (
        <React.Fragment key={s.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: `${col[s.status] ?? theme.sub}15`,
              border: `1.5px solid ${col[s.status] ?? theme.sub}44`,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Mono,monospace', fontSize: 14,
              color: col[s.status] ?? theme.sub,
            }}>{icon[s.action] ?? '•'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
                  {s.action.toUpperCase()} · {s.fromToken} → {s.toToken}
                </span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.text, fontWeight: 700 }}>
                  {s.totalAmount} {s.fromToken}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: col[s.status] ?? theme.sub, letterSpacing: 1 }}>
                  {s.status.toUpperCase()}
                  {s.action === 'dca' ? ` · ${s.swapsCompleted}/${s.swapsTotal} buys` : ''}
                </span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {i < sessions.length - 1 && <div style={{ height: 1, background: theme.bdr }} />}
        </React.Fragment>
      ))}

      {!loading && !showSessions && MOCK_ACTIVITY.map((tx, i) => {
        const c = tx.status === 'done' ? theme.accent : tx.status === 'revoked' ? theme.red : '#D4930A';
        return (
          <React.Fragment key={tx.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <div style={{
                width: 40, height: 40, flexShrink: 0,
                background: `${c}15`, border: `1.5px solid ${c}44`, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Mono,monospace', fontSize: 8, color: c, fontWeight: 700,
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
            {i < MOCK_ACTIVITY.length - 1 && <div style={{ height: 1, background: theme.bdr }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
