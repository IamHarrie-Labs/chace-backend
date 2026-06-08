import React, { useState } from "react";
import type { AgentType, LaunchParams } from "../types";
import { TOKENS } from "../types";
import { useTheme } from "../ThemeContext";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";

interface Props {
  initialType: AgentType;
  onLaunch: (params: LaunchParams) => void;
  onBack: () => void;
}

const TYPE_CARDS: { id: AgentType; label: string; desc: string }[] = [
  { id: 'dca',   label: 'DCA',         desc: 'Average your entry over time'    },
  { id: 'limit', label: 'Limit Order', desc: 'Buy when price hits your target' },
  { id: 'yield', label: 'Yield',       desc: 'Auto-compound staking rewards'   },
  { id: 'bills', label: 'Bills',       desc: 'Pay subscriptions via Bitrefill' },
];

const BILL_SERVICES = ['Netflix', 'Spotify', 'Amazon Prime', 'YouTube Premium', 'Apple TV+', 'Disney+', 'Xbox Game Pass'];

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

export default function NewStrategyScreen({ initialType, onLaunch, onBack }: Props) {
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
  const [email, setEmail]     = useState('');

  const usd = (parseFloat(amt || '0') * 4.87).toFixed(2);
  const autoName = type === 'dca'   ? `${from} → ${to} DCA`
                 : type === 'limit' ? `Buy ${from} < $${lp}`
                 : type === 'yield' ? `${from} Yield`
                 : `${service} Auto-Pay`;

  const inp: React.CSSProperties = { width: '100%', background: theme.card, border: '2px solid #0A0A18', borderRadius: 8, padding: '13px 52px 13px 16px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: theme.text, outline: 'none', boxSizing: 'border-box', boxShadow: '3px 3px 0 #0A0A18' };
  const pBtn = (active: boolean): React.CSSProperties => ({ ...nb(active ? '#0A0A18' : theme.card, 50, active ? '3px 3px 0 rgba(0,0,0,0.3)' : '2px 2px 0 #0A0A18'), flex: 1, padding: '10px 4px', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, color: active ? '#fff' : '#6B7280', cursor: 'pointer', border: `2px solid ${active ? '#0A0A18' : '#E5E7EB'}` });

  return (
    <div>
      {/* ── Teal header ── */}
      <div style={{ background: theme.accent, paddingBottom: 44 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 5, fontSize: 20, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>‹</button>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, color: '#0A0A18', lineHeight: 1 }}>New Strategy</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: 2, marginTop: 5 }}>STEP {step} OF 3</div>
          </div>
        </div>
      </div>

      {/* ── Cream body ── */}
      <div style={{ background: theme.bg, borderRadius: '26px 26px 0 0', marginTop: -26, paddingTop: 24 }}>

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px', marginBottom: 22 }}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ ...nb(s < step ? theme.accent : s === step ? '#0A0A18' : '#E5E7EB', 50, s === step ? `2px 2px 0 #0A0A18` : 'none'), width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: s < step ? '#0A0A18' : s === step ? theme.accent : '#9CA3AF', border: `2px solid ${s < step ? theme.accent : s === step ? '#0A0A18' : '#E5E7EB'}` }}>
                {s < step ? '✓' : s}
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: s < step ? theme.accent : '#E5E7EB' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 14 }}>Choose strategy</div>
              {TYPE_CARDS.map(opt => (
                <button key={opt.id} onClick={() => setType(opt.id)} style={{ ...nb(type === opt.id ? `${theme.accent}12` : theme.card, 14, type === opt.id ? `5px 5px 0 #0A0A18` : `4px 4px 0 #0A0A18`), width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '16px', cursor: 'pointer', marginBottom: 10, border: `2px solid ${type === opt.id ? theme.accent : '#0A0A18'}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: type === opt.id ? theme.accent : theme.text }}>{opt.label}</div>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: 10, height: 10, background: type === opt.id ? theme.accent : '#E5E7EB', border: `2px solid ${type === opt.id ? theme.accent : '#0A0A18'}` }} />
                </button>
              ))}
              <div style={{ marginBottom: 14, marginTop: 4 }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>AGENT NAME <span style={{ color: '#9CA3AF' }}>(optional)</span></div>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={autoName} style={{ width: '100%', background: theme.card, border: '2px solid #0A0A18', color: theme.text, fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600, borderRadius: 8, outline: 'none', padding: '11px 14px', boxSizing: 'border-box', boxShadow: '3px 3px 0 #0A0A18' }} />
              </div>
              <button onClick={() => setStep(2)} style={{ ...nb(theme.accent, 50, `4px 4px 0 #0A0A18`), width: '100%', border: `2px solid #0A0A18`, padding: '16px', color: '#0A0A18', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Continue →</button>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 16 }}>Configure</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {type === 'bills' ? (
                  <>
                    {/* How it works */}
                    <div style={{ ...nb(`${theme.accent}0A`, 10, 'none'), padding: '12px 14px', border: `1.5px solid ${theme.accent}44` }}>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: theme.accent, letterSpacing: 2, marginBottom: 4 }}>HOW BILLS WORKS</div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', lineHeight: 1.8 }}>
                        Chace pays your subscription via <strong style={{ color: theme.text }}>Bitrefill</strong> using TON from your agent wallet. You need a free Bitrefill account — your email links the payment to your account.
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>SELECT SERVICE</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {BILL_SERVICES.map(s => (
                          <button key={s} onClick={() => setService(s)} style={{ ...nb(service === s ? `${theme.accent}18` : theme.card, 50, '2px 2px 0 #0A0A18'), padding: '8px 14px', color: service === s ? theme.accent : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `2px solid ${service === s ? theme.accent : '#0A0A18'}` }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>BITREFILL EMAIL</div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        style={{ width: '100%', background: theme.card, border: `2px solid ${email ? '#0A0A18' : '#0A0A18'}`, borderRadius: 8, padding: '13px 16px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600, color: theme.text, outline: 'none', boxSizing: 'border-box' as const, boxShadow: '3px 3px 0 #0A0A18' }}
                      />
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#9CA3AF', marginTop: 5 }}>The email on your Bitrefill account — payment is delivered here</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>MONTHLY BUDGET (TON)</div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={inp} />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono, monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }}>TON</span>
                      </div>
                    </div>
                    {/* Testnet / dev notice */}
                    <div style={{ ...nb(`${theme.red}08`, 8, 'none'), padding: '10px 12px', border: `1px solid ${theme.red}33` }}>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.red, lineHeight: 1.7 }}>
                        ⚠ On testnet, the agent is created but no real payment is sent. Bitrefill payments go live when deployed to mainnet TON.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>TOKEN PAIR</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <select value={from} onChange={e => setFrom(e.target.value)} style={{ flex: 1, background: theme.card, border: '2px solid #0A0A18', borderRadius: 8, padding: '12px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: theme.text, cursor: 'pointer', outline: 'none', boxShadow: '3px 3px 0 #0A0A18' }}>
                          {TOKENS.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <span style={{ fontSize: 22, color: '#6B7280', flexShrink: 0, fontWeight: 700 }}>→</span>
                        <select value={to} onChange={e => setTo(e.target.value)} style={{ flex: 1, background: theme.card, border: '2px solid #0A0A18', borderRadius: 8, padding: '12px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: theme.text, cursor: 'pointer', outline: 'none', boxShadow: '3px 3px 0 #0A0A18' }}>
                          {TOKENS.filter(t => t !== from).map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>TOTAL AMOUNT</div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={inp} />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono, monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }}>{from}</span>
                      </div>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', marginTop: 5 }}>≈ ${usd} USD</div>
                    </div>
                    {type === 'dca' && (
                      <>
                        <div>
                          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>NUMBER OF BUYS</div>
                          <div style={{ display: 'flex', gap: 8 }}>{[3, 6, 12, 24].map(n => <button key={n} onClick={() => setBuys(n)} style={pBtn(buys === n)}>{n}</button>)}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>FREQUENCY</div>
                          <div style={{ display: 'flex', gap: 8 }}>{['hourly', 'daily', 'weekly'].map(f => <button key={f} onClick={() => setFreq(f)} style={pBtn(freq === f)}>{f}</button>)}</div>
                        </div>
                      </>
                    )}
                    {type === 'limit' && (
                      <div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 8 }}>BUY BELOW (USD)</div>
                        <div style={{ position: 'relative' }}>
                          <input type="number" value={lp} onChange={e => setLp(e.target.value)} style={inp} />
                          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono, monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }}>USD</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button onClick={() => setStep(1)} style={{ ...nb(theme.card, 50, '3px 3px 0 #0A0A18'), flex: 1, border: '2px solid #0A0A18', padding: '14px', color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ ...nb(theme.accent, 50, `4px 4px 0 #0A0A18`), flex: 2, border: '2px solid #0A0A18', padding: '14px', color: '#0A0A18', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Review →</button>
              </div>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 14 }}>Review</div>
              <div style={{ ...nb(theme.card, 12, `5px 5px 0 #0A0A18`), padding: '18px', marginBottom: 14 }}>
                {([
                  ['Strategy', type === 'dca' ? 'Dollar Cost Average' : type === 'limit' ? 'Limit Order' : type === 'yield' ? 'Yield Farming' : 'Bill Payment'],
                  ...(type === 'bills' ? [['Service', service], ['Email', email || '(none)'], ['Budget', `${amt} TON/month · $${usd}`]] : [
                    ['Pair', `${from} → ${to}`],
                    ['Amount', `${amt} ${from} · $${usd}`],
                    ...(type === 'dca' ? [['Buys', `${buys} × ${(parseFloat(amt||'0')/buys).toFixed(2)} ${from}`], ['Frequency', freq]] : []),
                    ...(type === 'limit' ? [['Trigger', `${from} < $${lp}`]] : []),
                  ]),
                  ['Wallet', walletAddress ? `${walletAddress.slice(0,6)}…${walletAddress.slice(-4)}` : '⚠ not connected'],
                ] as [string, string][]).map(([k, v], i, arr) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{k}</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: k === 'Wallet' && !walletAddress ? theme.red : theme.text, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...nb(`${theme.accent}14`, 10, `4px 4px 0 #0A0A18`), padding: '16px', marginBottom: 22, border: `2px solid ${theme.accent}` }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent, letterSpacing: 2, marginBottom: 5 }}>
                  {type === 'bills' ? 'MONTHLY AUTO-PAY' : 'FUNDING AGENT WALLET'}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: theme.accent, letterSpacing: -1 }}>{amt} {type === 'bills' ? 'TON/mo' : from}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', marginTop: 4, lineHeight: 1.6 }}>Revoke any time to reclaim unused funds.</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ ...nb(theme.card, 50, '3px 3px 0 #0A0A18'), flex: 1, border: '2px solid #0A0A18', padding: '14px', color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                {walletAddress ? (
                  <button onClick={() => onLaunch({ type, name: name || undefined, from, to, amt, buys, freq, lp, service, email: email || undefined })} style={{ ...nb(theme.accent, 50, `4px 4px 0 #0A0A18`), flex: 2, border: '2px solid #0A0A18', padding: '14px', color: '#0A0A18', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Fund + Launch ⟳</button>
                ) : (
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ background: `${theme.red}12`, border: `1.5px solid ${theme.red}44`, borderRadius: 8, padding: '10px', textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 10, color: theme.red }}>Connect wallet to launch</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}><TonConnectButton /></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
