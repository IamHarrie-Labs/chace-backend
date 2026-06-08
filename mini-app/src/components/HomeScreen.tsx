import React from "react";
import type { Agent, AgentType } from "../types";
import { useTheme } from "../ThemeContext";
import BalanceCard from "./BalanceCard";
import AgentCard from "./AgentCard";
import ChaceMark from "./ChaceMark";
import { TonConnectButton } from "@tonconnect/ui-react";

interface Props {
  agents: Agent[];
  onNew: (type: AgentType | 'swap') => void;
  onRevoke: (id: number) => void;
  onChat: (id: number) => void;
  onAnalytics: (id: number) => void;
  onViewAll: () => void;
  onActivity: () => void;
  walletAddress: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

const IcoDca    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IcoTarget = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>;
const IcoStar   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoSwap   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const IcoBills  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

export default function HomeScreen({ agents, onNew, onRevoke, onChat, onAnalytics, onViewAll, onActivity, walletAddress, isDark, onToggleTheme }: Props) {
  const { theme } = useTheme();
  const active = agents.filter(a => a.status !== 'complete');
  const feat   = active[0] ?? null;

  const qas = [
    { id: 'dca'   as AgentType | 'swap', Ico: IcoDca,    label: 'DCA',    color: theme.accent },
    { id: 'limit' as AgentType | 'swap', Ico: IcoTarget, label: 'Limit',  color: '#7B5CF6'    },
    { id: 'yield' as AgentType | 'swap', Ico: IcoStar,   label: 'Yield',  color: '#F59E0B'    },
    { id: 'swap'  as AgentType | 'swap', Ico: IcoSwap,   label: 'Swap',   color: '#3B82F6'    },
  ];

  return (
    <div>
      {/* ── Teal hero header ── */}
      <div style={{ background: theme.accent, paddingBottom: 44 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: -2.5, color: '#0A0A18', lineHeight: 1 }}>Home</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: 2.5, marginTop: 6 }}>
              {walletAddress ? `${walletAddress.slice(0,6)}…${walletAddress.slice(-4)}` : 'AUTONOMOUS DeFi · TON'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
              <TonConnectButton />
            </div>
            <button onClick={onToggleTheme} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Cream body ── */}
      <div style={{ background: theme.bg, borderRadius: '26px 26px 0 0', marginTop: -26, paddingTop: 24 }}>

        {/* Balance card */}
        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          <BalanceCard />
        </div>

        {/* Featured agent — violet gradient card */}
        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          {feat ? (
            <div style={{ ...nb('linear-gradient(140deg, #7B5CF6 0%, #5237C8 100%)', 20, '5px 5px 0 #0A0A18'), padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {/* Watermark */}
              <div style={{ position: 'absolute', right: -10, bottom: -16, opacity: 0.08, pointerEvents: 'none' }}>
                <ChaceMark size={130} color="#fff" />
              </div>
              {/* Status badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${theme.accent}2E`, border: `1px solid ${theme.accent}66`, borderRadius: 4, padding: '4px 10px', marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, background: theme.accent, borderRadius: 0 }} />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent, letterSpacing: 2, fontWeight: 700 }}>RUNNING NOW</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 4 }}>{feat.title}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>{feat.subtitle}</div>
              {feat.totalBuys > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{feat.completedBuys}/{feat.totalBuys} buys done</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent }}>Next: {feat.nextIn}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 0 }}>
                    <div style={{ width: `${(feat.completedBuys / feat.totalBuys) * 100}%`, height: '100%', background: theme.accent }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: theme.accent, fontWeight: 700 }}>{feat.amount}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onAnalytics(feat.id)} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 4, padding: '7px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>ANALYTICS</button>
                  <button onClick={() => onRevoke(feat.id)} style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 4, padding: '7px 14px', fontFamily: 'Space Mono, monospace', fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>REVOKE</button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => onNew('dca')} style={{ ...nb(`${theme.accent}14`, 16, `4px 4px 0 #0A0A18`), width: '100%', padding: '28px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: '2px dashed #0A0A18', boxShadow: 'none' }}>
              <div style={{ ...nb(theme.accent, 4, '3px 3px 0 #0A0A18'), width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#0A0A18', borderRadius: 4 }}>+</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0A0A18' }}>Create your first agent</div>
            </button>
          )}
        </div>

        {/* Your Agents — horizontal scroll */}
        {agents.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: 14 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>Your Agents</span>
              <button onClick={onViewAll} style={{ ...nb(theme.card, 4, '2px 2px 0 #0A0A18'), padding: '4px 12px', color: theme.text, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', borderRadius: 4 }}>See all →</button>
            </div>
            <div className="hscroll">
              {agents.map(a => {
                const done = a.status === 'complete';
                return (
                  <div key={a.id} style={{ minWidth: 180, flexShrink: 0 }}>
                    <div onClick={() => onChat(a.id)} style={{ ...nb(theme.card, 12, done ? '2px 2px 0 rgba(0,0,0,0.1)' : '4px 4px 0 #0A0A18'), padding: '14px', opacity: done ? 0.55 : 1, border: `2px solid ${done ? '#ddd' : '#0A0A18'}`, cursor: 'pointer' }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1.5, color: done ? '#9CA3AF' : theme.accent, border: `1px solid ${done ? '#ddd' : theme.accent}`, borderRadius: 3, padding: '2px 7px' }}>
                        {done ? 'DONE' : a.type === 'limit' ? 'WATCHING' : a.type === 'yield' ? 'YIELDING' : a.type === 'bills' ? 'ACTIVE' : 'RUNNING'}
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginTop: 10, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', marginBottom: 10 }}>{a.subtitle}</div>
                      {a.totalBuys > 0 && (
                        <div style={{ height: 3, background: '#E5E7EB', marginBottom: 8 }}>
                          <div style={{ width: `${(a.completedBuys / a.totalBuys) * 100}%`, height: '100%', background: theme.accent }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: theme.text }}>{a.amount}</span>
                        <button onClick={e => { e.stopPropagation(); onAnalytics(a.id); }} style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}55`, borderRadius: 4, padding: '3px 8px', fontFamily: 'Space Mono, monospace', fontSize: 8, color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>📊</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Yield-to-Pay Feature Banner ── */}
        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          <div style={{ ...nb('#0A0A18', 16, `5px 5px 0 ${theme.accent}`), padding: '18px', border: `2px solid #0A0A18`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -8, top: -8, opacity: 0.06, pointerEvents: 'none' }}>
              <ChaceMark size={90} color="#fff" />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${theme.accent}25`, border: `1px solid ${theme.accent}55`, borderRadius: 4, padding: '3px 10px', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent, letterSpacing: 2, fontWeight: 700 }}>YIELD-TO-PAY</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFDE9', letterSpacing: -0.5, marginBottom: 5, lineHeight: 1.2 }}>
              Pay your bills<br />with DeFi yield
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.7 }}>
              Netflix · Spotify · ChatGPT<br />Auto-pay subscriptions with earned yield.
            </div>
            <button onClick={() => onNew('bills')} style={{ ...nb(theme.accent, 50, `3px 3px 0 ${theme.accent}88`), border: `2px solid ${theme.accent}`, padding: '11px 22px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 800, color: '#0A0A18', cursor: 'pointer' }}>
              Set up auto-pay →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: -0.5, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {qas.map(({ id, Ico, label, color }) => (
              <button key={id} onClick={() => onNew(id)} style={{ ...nb(theme.card, 50, '3px 3px 0 #0A0A18'), display: 'flex', alignItems: 'center', gap: 9, padding: '11px 18px', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: theme.text }}>
                <span style={{ color }}><Ico /></span>
                {label}
              </button>
            ))}
            <button onClick={() => onNew('bills')} style={{ ...nb(theme.card, 50, '3px 3px 0 #0A0A18'), display: 'flex', alignItems: 'center', gap: 9, padding: '11px 18px', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: theme.text }}>
              <span style={{ color: '#10B981' }}><IcoBills /></span>
              Bills
            </button>
          </div>
        </div>

        {/* Activity log link */}
        <div style={{ padding: '0 20px 8px' }}>
          <button onClick={onActivity} style={{ ...nb(theme.card, 10, '3px 3px 0 #0A0A18'), width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: theme.text }}>ACTIVITY LOG</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280' }}>View all →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
