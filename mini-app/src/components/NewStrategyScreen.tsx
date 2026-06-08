import React, { useState } from "react";
import type { AgentType, LaunchParams } from "../types";
import { TOKENS } from "../types";
import { useTheme } from "../ThemeContext";

interface Props {
  initialType: AgentType;
  onLaunch: (params: LaunchParams) => void;
}

const TYPE_CARDS: { id: AgentType; label: string; desc: string }[] = [
  { id: 'dca',   label: 'DCA',         desc: 'Buy at average price over time' },
  { id: 'limit', label: 'Limit Order', desc: 'Buy when price hits your target' },
  { id: 'yield', label: 'Yield',        desc: 'Auto-compound staking rewards' },
];

export default function NewStrategyScreen({ initialType, onLaunch }: Props) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AgentType>(initialType);
  const [from, setFrom] = useState('TON');
  const [to, setTo]     = useState('USDT');
  const [amt, setAmt]   = useState('30');
  const [buys, setBuys] = useState(6);
  const [freq, setFreq] = useState('daily');
  const [lp, setLp]     = useState('3.80');

  const usd = (parseFloat(amt || '0') * 4.87).toFixed(2);

  const inputStyle: React.CSSProperties = {
    width: '100%', background: theme.card, border: `1.5px solid ${theme.bdr}`,
    color: theme.text, fontFamily: 'Space Grotesk,sans-serif',
    fontSize: 20, fontWeight: 700, borderRadius: 6, outline: 'none',
    padding: '10px 56px 10px 14px', boxSizing: 'border-box',
  };
  const selectStyle: React.CSSProperties = {
    flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`,
    color: theme.text, padding: '10px 12px',
    fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', borderRadius: 6, outline: 'none',
  };

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {[1,2,3].map((s,i) => (
          <React.Fragment key={s}>
            <div style={{
              width: 26, height: 26, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${s <= step ? theme.accent : theme.bdr}`,
              background: s < step ? theme.accent : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700,
              color: s < step ? '#fff' : s === step ? theme.accent : theme.sub,
            }}>
              {s < step ? '✓' : s}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: s < step ? theme.accent : theme.bdr }} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <>
          <div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 10 }}>
              CHOOSE STRATEGY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TYPE_CARDS.map(opt => (
                <button key={opt.id} onClick={() => setType(opt.id)} style={{
                  background: type === opt.id ? `${theme.accent}12` : theme.card,
                  border: `1.5px solid ${type === opt.id ? theme.accent : theme.bdr}`,
                  boxShadow: type === opt.id ? `3px 3px 0 ${theme.accent}33` : 'none',
                  borderRadius: 8, padding: '14px 16px', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: type === opt.id ? theme.accent : theme.text, marginBottom: 3 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: type === opt.id ? theme.accent : theme.dim, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)} style={{
            background: theme.accent, border: `2px solid ${theme.accent}`,
            color: '#fff', padding: '14px', borderRadius: 8,
            fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>CONTINUE →</button>
        </>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }}>TOKEN PAIR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>
                  {TOKENS.map(t => <option key={t}>{t}</option>)}
                </select>
                <span style={{ color: theme.sub, fontSize: 18, flexShrink: 0 }}>→</span>
                <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>
                  {TOKENS.filter(t => t !== from).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }}>TOTAL AMOUNT</div>
              <div style={{ position: 'relative' }}>
                <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={inputStyle} />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }}>{from}</span>
              </div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, marginTop: 5 }}>≈ ${usd} USD</div>
            </div>

            {type === 'dca' && (
              <>
                <div>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }}>NUMBER OF BUYS</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[3,6,12,24].map(n => (
                      <button key={n} onClick={() => setBuys(n)} style={{
                        flex: 1, background: buys === n ? `${theme.accent}18` : theme.card,
                        border: `1.5px solid ${buys === n ? theme.accent : theme.bdr}`,
                        color: buys === n ? theme.accent : theme.text,
                        padding: '10px 4px', fontFamily: 'Space Mono,monospace',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 6,
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }}>FREQUENCY</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['hourly','daily','weekly'].map(f => (
                      <button key={f} onClick={() => setFreq(f)} style={{
                        flex: 1, background: freq === f ? `${theme.accent}18` : theme.card,
                        border: `1.5px solid ${freq === f ? theme.accent : theme.bdr}`,
                        color: freq === f ? theme.accent : theme.text,
                        padding: '10px 4px', fontFamily: 'Space Mono,monospace',
                        fontSize: 9, fontWeight: 700, letterSpacing: 1,
                        cursor: 'pointer', borderRadius: 6, textTransform: 'uppercase',
                      }}>{f}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {type === 'limit' && (
              <div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }}>BUY BELOW PRICE (USD)</div>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={lp} onChange={e => setLp(e.target.value)} style={inputStyle} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }}>USD</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
              padding: '13px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8,
            }}>← BACK</button>
            <button onClick={() => setStep(3)} style={{
              flex: 2, background: theme.accent, border: `2px solid ${theme.accent}`,
              color: '#fff', padding: '13px',
              fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer', borderRadius: 8,
            }}>REVIEW →</button>
          </div>
        </>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <>
          <div style={{
            background: theme.card, border: `1.5px solid ${theme.accent}`,
            boxShadow: `4px 4px 0 ${theme.accent}33`, borderRadius: 8, padding: '16px',
          }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.accent, letterSpacing: 2, marginBottom: 14 }}>
              REVIEW STRATEGY
            </div>
            {([
              ['Type',   type === 'dca' ? 'Dollar Cost Average' : type === 'limit' ? 'Limit Order' : 'Yield Farming'],
              ['Pair',   `${from} → ${to}`],
              ['Amount', `${amt} ${from}  (≈ $${usd})`],
              ...(type === 'dca' ? [
                ['Buys', `${buys} × ${(parseFloat(amt||'0')/buys).toFixed(2)} ${from}`],
                ['Freq', freq],
              ] : type === 'limit' ? [
                ['Trigger', `${from} < $${lp}`],
              ] : []),
            ] as [string,string][]).map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${theme.bdr}` }}>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }}>{k}</span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.text, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ background: `${theme.accent}10`, border: `1px solid ${theme.accent}33`, borderRadius: 6, padding: '12px', marginTop: 14 }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 8, color: theme.accent, letterSpacing: 2, marginBottom: 5 }}>
                AGENT WALLET FUNDED WITH
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: theme.accent }}>{amt} {from}</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, marginTop: 4, lineHeight: 1.5 }}>
                Revoke at any time to reclaim unused funds.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
              padding: '13px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8,
            }}>← BACK</button>
            <button onClick={() => onLaunch({ type, from, to, amt, buys, freq, lp })} style={{
              flex: 2, background: theme.accent, border: `2px solid ${theme.accent}`,
              color: '#fff', padding: '13px',
              fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer', borderRadius: 8,
            }}>FUND + LAUNCH ⟳</button>
          </div>
        </>
      )}
    </div>
  );
}
