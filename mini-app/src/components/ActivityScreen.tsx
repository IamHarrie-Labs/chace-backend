import React, { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import { api, type ApiSession } from "../api";

interface Props {
  walletAddress: string;
  onBack: () => void;
}

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000)    return 'just now';
  if (diff < 3600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

export default function ActivityScreen({ walletAddress, onBack }: Props) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<ApiSession[] | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      setSessions([]);
      return;
    }
    setLoading(true);
    setError(null);
    api.getSessions(walletAddress)
      .then(r => { setSessions(r.sessions ?? []); })
      .catch(e => { setError(e.message); setSessions([]); })
      .finally(() => setLoading(false));
  }, [walletAddress]);

  const statusColor: Record<string, string> = {
    active:    theme.accent,
    completed: theme.accent,
    revoked:   theme.red,
    pending:   '#F59E0B',
  };

  const typeIcon: Record<string, string> = {
    dca: 'DCA', swap: 'SWP', limit: 'LMT', yield: 'YLD', bills: 'BIL',
  };

  return (
    <div>
      {/* ── Teal header ── */}
      <div style={{ background: theme.accent, paddingBottom: 44 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 5, fontSize: 20, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>‹</button>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: '#0A0A18', lineHeight: 1 }}>Activity</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: 2, marginTop: 5 }}>
              {sessions ? `${sessions.length} SESSION${sessions.length !== 1 ? 'S' : ''}` : 'ALL TRANSACTIONS'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cream body ── */}
      <div style={{ background: theme.bg, borderRadius: '26px 26px 0 0', marginTop: -26, paddingTop: 20 }}>

        {/* Not connected */}
        {!walletAddress && !loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ ...nb(`${theme.accent}10`, 12, '3px 3px 0 #0A0A18'), padding: '28px 20px', display: 'inline-block', border: `2px dashed #0A0A18`, boxShadow: 'none' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔌</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 8 }}>No wallet connected</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', lineHeight: 1.8 }}>
                Connect your TON wallet to<br />see your activity history.
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280' }}>
            Loading…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ margin: '0 20px 16px', ...nb(`${theme.red}0A`, 10, 'none'), padding: '14px 16px', border: `1.5px solid ${theme.red}44` }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.red, letterSpacing: 1.5, marginBottom: 4 }}>BACKEND OFFLINE</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{error}</div>
          </div>
        )}

        {/* Empty state — wallet connected but no history */}
        {!loading && walletAddress && sessions !== null && sessions.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ ...nb(theme.card, 12, '4px 4px 0 #0A0A18'), padding: '36px 24px', display: 'inline-block', width: '100%', maxWidth: 300 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 8 }}>No activity yet</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', lineHeight: 1.9 }}>
                Deploy your first agent to start<br />seeing real transactions here.
              </div>
            </div>
          </div>
        )}

        {/* Sessions list */}
        {!loading && sessions && sessions.length > 0 && (
          <div style={{ ...nb(theme.card, 12, '5px 5px 0 #0A0A18'), margin: '0 20px', overflow: 'hidden' }}>
            {sessions.map((s, i) => {
              const c   = statusColor[s.status] ?? '#6B7280';
              const lbl = typeIcon[s.action]    ?? '···';
              return (
                <React.Fragment key={s.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                    <div style={{ background: `${c}14`, border: `1.5px solid ${c}44`, borderRadius: 8, width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 9, color: c, fontWeight: 700 }}>
                      {lbl}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text, textTransform: 'uppercase', flexShrink: 0 }}>
                          {s.action} · {s.fromToken}→{s.toToken}
                        </span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: theme.text, fontWeight: 700, flexShrink: 0 }}>
                          {s.totalAmount} {s.fromToken}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, gap: 8 }}>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: c }}>
                          {s.status}{s.action === 'dca' ? ` · ${s.swapsCompleted}/${s.swapsTotal}` : ''}
                        </span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
                          {timeAgo(s.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {i < sessions.length - 1 && <div style={{ height: 1, background: '#E5E7EB', margin: '0 18px' }} />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
