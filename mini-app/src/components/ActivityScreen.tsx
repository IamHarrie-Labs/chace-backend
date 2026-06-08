import React, { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { api, type ApiSession } from "../api";
import { MOCK_ACTIVITY } from "../mockData";

interface Props {
  onBack: () => void;
}

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

export default function ActivityScreen({ onBack }: Props) {
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
    completed: theme.accent,
    revoked:   theme.red,
    pending:   '#F59E0B',
  };

  const typeIcon: Record<string, string> = { dca:'DCA', swap:'SWP', limit:'LMT', yield:'YLD', bills:'BIL' };

  const showSessions = sessions && sessions.length > 0;

  return (
    <div>
      {/* ── Teal header ── */}
      <div style={{ background: theme.accent, paddingBottom: 44 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 5, fontSize: 20, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>‹</button>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: '#0A0A18', lineHeight: 1 }}>Activity</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: 2, marginTop: 5 }}>ALL TRANSACTIONS</div>
          </div>
        </div>
      </div>

      {/* ── Cream body ── */}
      <div style={{ background: theme.bg, borderRadius: '26px 26px 0 0', marginTop: -26, paddingTop: 20 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280' }}>Loading…</div>
        )}

        {!loading && (
          <div style={{ ...nb(theme.card, 12, `5px 5px 0 #0A0A18`), margin: '0 20px', overflow: 'hidden' }}>
            {showSessions ? sessions.map((s, i) => {
              const c = statusColor[s.status] ?? '#6B7280';
              const lbl = typeIcon[s.action] ?? '···';
              return (
                <React.Fragment key={s.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                    <div style={{ ...nb(`${c}14`, 8, '2px 2px 0 #0A0A18'), width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 9, color: c, fontWeight: 700, border: `1.5px solid ${c}44`, borderRadius: 8, boxShadow: 'none' }}>{lbl}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{s.action.toUpperCase()} · {s.fromToken} → {s.toToken}</span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: theme.text, fontWeight: 700 }}>{s.totalAmount} {s.fromToken}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{s.status}{s.action === 'dca' ? ` · ${s.swapsCompleted}/${s.swapsTotal}` : ''}</span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#9CA3AF' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {i < sessions.length - 1 && <div style={{ height: 1, background: '#E5E7EB', margin: '0 18px' }} />}
                </React.Fragment>
              );
            }) : MOCK_ACTIVITY.map((tx, i) => {
              const c = tx.status === 'done' ? theme.accent : tx.status === 'revoked' ? theme.red : '#F59E0B';
              return (
                <React.Fragment key={tx.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                    <div style={{ background: `${c}14`, border: `1.5px solid ${c}44`, borderRadius: 8, width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 9, color: c, fontWeight: 700 }}>{tx.label}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{tx.type}</span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: theme.text, fontWeight: 700 }}>{tx.amt}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{tx.pair}</span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#9CA3AF' }}>{tx.time}</span>
                      </div>
                    </div>
                  </div>
                  {i < MOCK_ACTIVITY.length - 1 && <div style={{ height: 1, background: '#E5E7EB', margin: '0 18px' }} />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
