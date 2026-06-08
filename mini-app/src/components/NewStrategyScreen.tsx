import React, { useState } from "react";
import type { AgentType, LaunchParams } from "../types";
import { TOKENS } from "../types";
import { useTheme } from "../ThemeContext";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";

interface Props {
  initialType: AgentType;
  onLaunch: (params: LaunchParams) => void;
}

const TYPE_CARDS: { id: AgentType; label: string; desc: string; icon: string }[] = [
  { id: 'dca',   label: 'DCA',         icon: '⟳', desc: 'Buy at average price over time' },
  { id: 'limit', label: 'Limit Order', icon: '⊙', desc: 'Buy when price hits your target' },
  { id: 'yield', label: 'Yield',       icon: '◈', desc: 'Auto-compound staking rewards' },
  { id: 'bills', label: 'Bills',       icon: '◎', desc: 'Pay subscriptions in TON via Bitrefill' },
];

const BILL_SERVICES = ['Netflix', 'Spotify', 'Amazon Prime', 'YouTube Premium', 'Apple TV+', 'Disney+', 'Xbox Game Pass'];

export default function NewStrategyScreen({ initialType, onLaunch }: Props) {
  const { theme } = useTheme();
  const walletAddress = useTonAddress();

  const [step, setStep]       = useState(1);
  const [type, setType]       = useState<AgentType>(initialType);
  const [name, setName]       = useState('');
  const [from, setFrom]       = useState('TON');
  const [to, setTo]           = useState('USDT');
  const [amt, setAmt]         = useState('30');
  const [buys, setBuys]       = useState(6);
  const [freq, setFreq]       = useState('daily');
  const [lp, setLp]           = useState('3.80');
  const [service, setService] = useState('Netflix');

  const usd = (parseFloat(amt || '0') * 4.87).toFixed(2);

  const autoName = type === 'dca'   ? `${from} → ${to} DCA`
                 : type === 'limit' ? `Buy ${from} < $${lp}`
                 : type === 'yield' ? `${from} Yield`
                 : `${service ?? 'Bills'} Auto-Pay`;

  const inputStyle: React.CSSProperties = {
    width: '100%', background: theme.bg,
    border: `1.5px solid ${theme.bdr}`,
    color: theme.text, fontFamily: 'Inter, sans-serif',
    fontSize: 22, fontWeight: 700, borderRadius: 12, outline: 'none',
    padding: '12px 56px 12px 16px', boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    flex: 1, background: theme.bg,
    border: `1.5px solid ${theme.bdr}`,
    color: theme.text, padding: '11px 12px',
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', borderRadius: 12, outline: 'none',
  };

  const cardStyle = (active: boolean): React.CSSProperties => ({
    background: active ? `${theme.accent}12` : theme.card,
    border: `1.5px solid ${active ? theme.accent : theme.bdr}`,
    borderRadius: 14, padding: '14px 16px', textAlign: 'left',
    cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: active ? `0 4px 16px ${theme.accent}22` : '0 1px 6px rgba(0,0,0,0.05)',
  });

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Section title */}
      <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, padding: '4px 4px 0' }}>
        New Strategy
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {[1,2,3].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: s < step ? theme.accent : s === step ? `${theme.accent}18` : theme.dim,
              border: `2px solid ${s <= step ? theme.accent : theme.bdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: s < step ? '#fff' : s === step ? theme.accent : theme.sub,
            }}>
              {s < step ? '✓' : s}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: s < step ? theme.accent : theme.dim }} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 10 }}>
              Choose Strategy
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TYPE_CARDS.map(opt => (
                <button key={opt.id} onClick={() => setType(opt.id)} style={cardStyle(type === opt.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: type === opt.id ? `${theme.accent}18` : theme.dim,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, color: type === opt.id ? theme.accent : theme.sub,
                    }}>{opt.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: type === opt.id ? theme.accent : theme.text, marginBottom: 3 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 11, color: theme.sub }}>{opt.desc}</div>
                    </div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: type === opt.id ? theme.accent : 'transparent',
                    border: `2px solid ${type === opt.id ? theme.accent : theme.bdr}`,
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                  }}>
                    {type === opt.id ? '✓' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>
              Agent Name <span style={{ color: theme.bdr }}>(optional)</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={autoName}
              style={{
                width: '100%', background: theme.card,
                border: `1.5px solid ${theme.bdr}`,
                color: theme.text, fontFamily: 'Inter, sans-serif',
                fontSize: 15, fontWeight: 600, borderRadius: 12, outline: 'none',
                padding: '12px 16px', boxSizing: 'border-box',
              }}
            />
          </div>

          <button onClick={() => setStep(2)} style={{
            background: theme.accent, border: 'none',
            color: '#fff', padding: '15px', borderRadius: 20,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${theme.accent}44`,
          }}>Continue →</button>
        </>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {type === 'bills' ? (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Select Service</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {BILL_SERVICES.map(s => (
                      <button key={s} onClick={() => setService(s)} style={{
                        background: service === s ? theme.accent : theme.card,
                        border: `1.5px solid ${service === s ? theme.accent : theme.bdr}`,
                        color: service === s ? '#fff' : theme.text,
                        padding: '8px 14px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 20,
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Monthly Budget (TON)</div>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={inputStyle} />
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: theme.accent, fontWeight: 700 }}>TON</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.sub, marginTop: 5 }}>≈ ${usd} USD / month</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Token Pair</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>
                      {TOKENS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span style={{ color: theme.sub, fontSize: 20, flexShrink: 0 }}>→</span>
                    <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>
                      {TOKENS.filter(t => t !== from).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Total Amount</div>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={inputStyle} />
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: theme.accent, fontWeight: 700 }}>{from}</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.sub, marginTop: 5 }}>≈ ${usd} USD</div>
                </div>
                {type === 'dca' && (
                  <>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Number of Buys</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[3, 6, 12, 24].map(n => (
                          <button key={n} onClick={() => setBuys(n)} style={{
                            flex: 1, background: buys === n ? theme.accent : theme.card,
                            border: `1.5px solid ${buys === n ? theme.accent : theme.bdr}`,
                            color: buys === n ? '#fff' : theme.text,
                            padding: '11px 4px', fontSize: 15, fontWeight: 700,
                            cursor: 'pointer', borderRadius: 12,
                          }}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Frequency</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['hourly', 'daily', 'weekly'].map(f => (
                          <button key={f} onClick={() => setFreq(f)} style={{
                            flex: 1, background: freq === f ? theme.accent : theme.card,
                            border: `1.5px solid ${freq === f ? theme.accent : theme.bdr}`,
                            color: freq === f ? '#fff' : theme.text,
                            padding: '11px 4px', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', borderRadius: 12, textTransform: 'capitalize',
                          }}>{f}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {type === 'limit' && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.sub, letterSpacing: 0.3, marginBottom: 8 }}>Buy Below Price (USD)</div>
                    <div style={{ position: 'relative' }}>
                      <input type="number" value={lp} onChange={e => setLp(e.target.value)} style={inputStyle} />
                      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: theme.accent, fontWeight: 700 }}>USD</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
              padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 20,
            }}>← Back</button>
            <button onClick={() => setStep(3)} style={{
              flex: 2, background: theme.accent, border: 'none',
              color: '#fff', padding: '14px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', borderRadius: 20,
              boxShadow: `0 4px 16px ${theme.accent}44`,
            }}>Review →</button>
          </div>
        </>
      )}

      {/* ── Step 3: Review + wallet gate ── */}
      {step === 3 && (
        <>
          <div style={{
            background: theme.card,
            borderRadius: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '20px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>
              Review Strategy
            </div>

            {([
              ['Name',   name || autoName],
              ['Type',   type === 'dca' ? 'Dollar Cost Average' : type === 'limit' ? 'Limit Order' : type === 'yield' ? 'Yield Farming' : 'Bill Payment'],
              ...(type === 'bills' ? [
                ['Service', service],
                ['Budget', `${amt} TON/month (≈$${usd})`],
              ] : [
                ['Pair',   `${from} → ${to}`],
                ['Amount', `${amt} ${from}  (≈ $${usd})`],
                ...(type === 'dca' ? [
                  ['Buys', `${buys} × ${(parseFloat(amt||'0')/buys).toFixed(2)} ${from}`],
                  ['Freq', freq],
                ] : type === 'limit' ? [
                  ['Trigger', `${from} < $${lp}`],
                ] : []),
              ]),
            ] as [string,string][]).map(([k,v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: `1px solid ${theme.bdr}`,
              }}>
                <span style={{ fontSize: 12, color: theme.sub, fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 13, color: theme.text, fontWeight: 700 }}>{v}</span>
              </div>
            ))}

            {/* Wallet status */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: `1px solid ${theme.bdr}`,
            }}>
              <span style={{ fontSize: 12, color: theme.sub, fontWeight: 500 }}>Wallet</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: walletAddress ? theme.accent : theme.red }}>
                {walletAddress ? `${walletAddress.slice(0,6)}…${walletAddress.slice(-4)}` : '⚠ not connected'}
              </span>
            </div>

            {/* Summary pill */}
            <div style={{
              background: `${theme.accent}12`, borderRadius: 12,
              padding: '14px', marginTop: 14,
            }}>
              <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, marginBottom: 5 }}>
                {type === 'bills' ? 'Monthly Auto-Pay' : 'Agent Wallet Funded With'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: theme.accent }}>{amt} {type === 'bills' ? 'TON/mo' : from}</div>
              <div style={{ fontSize: 11, color: theme.sub, marginTop: 4, lineHeight: 1.5 }}>
                Revoke at any time to reclaim unused funds.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
              padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 20,
            }}>← Back</button>

            {walletAddress ? (
              <button onClick={() => onLaunch({ type, name: name || undefined, from, to, amt, buys, freq, lp, service })} style={{
                flex: 2, background: theme.accent, border: 'none',
                color: '#fff', padding: '14px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', borderRadius: 20,
                boxShadow: `0 4px 16px ${theme.accent}44`,
              }}>Fund + Launch ⟳</button>
            ) : (
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  background: `${theme.red}12`, border: `1.5px solid ${theme.red}33`,
                  borderRadius: 12, padding: '10px 14px', textAlign: 'center',
                  fontSize: 11, fontWeight: 600, color: theme.red,
                }}>
                  Connect wallet to launch
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <TonConnectButton />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
