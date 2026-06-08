import React, { useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useTheme } from "../ThemeContext";
import ChaceMark from "./ChaceMark";

interface Props {
  onConnected: () => void; // called after wallet successfully connects
}

type Step = 'welcome' | 'connect';

const nb = (bg = '#fff', r = 14, sh = '4px 4px 0 #0A0A18'): React.CSSProperties => ({
  background: bg, border: '2px solid #0A0A18', boxShadow: sh, borderRadius: r,
});

/* ── Welcome ──────────────────────────────────────────────────────────────── */
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const { theme } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px 28px 56px' }}>
      {/* Logo + headline */}
      <div style={{ textAlign: 'center', marginTop: 20, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...nb(`${theme.accent}18`, 24, `6px 6px 0 ${theme.accent}55`), width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: `2px solid ${theme.accent}55` }}>
          <ChaceMark size={48} color={theme.accent} />
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -3, color: '#FFFDE9', lineHeight: 1, marginBottom: 10 }}>Chace</div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: theme.accent, letterSpacing: 3, marginBottom: 32 }}>AUTONOMOUS DeFi · TON</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, textAlign: 'center', maxWidth: 260 }}>
          Chase yield.<br />Stay in control.
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 36, width: '100%' }}>
          {[
            { icon: '⟳', label: 'DCA — Auto-buy on schedule' },
            { icon: '◎', label: 'Limit — Buy below your price' },
            { icon: '✦', label: 'Yield — Auto-compound rewards' },
            { icon: '◻', label: 'Bills — Pay subs with yield' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '11px 16px' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: theme.accent }}>{f.icon}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ width: '100%', marginTop: 40 }}>
        <button onClick={onNext} style={{ ...nb(theme.accent, 50, `5px 5px 0 ${theme.accent}88`), width: '100%', border: `2px solid ${theme.accent}`, padding: '18px', color: '#0A0A18', fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.5 }}>
          Get Started →
        </button>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 14, letterSpacing: 1 }}>
          NON-CUSTODIAL · REVOCABLE AT ANY TIME
        </div>
      </div>
    </div>
  );
}

/* ── Connect Wallet ───────────────────────────────────────────────────────── */
function ConnectScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const [tonConnectUI] = useTonConnectUI();
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      await tonConnectUI.openModal();
    } catch {
      // user closed modal
    } finally {
      setConnecting(false);
    }
  }

  const wallets = [
    { name: 'Tonkeeper',    sub: 'Most popular TON wallet',  initials: 'TK', bg: '#2351F5' },
    { name: 'MyTonWallet',  sub: 'Fast & simple',            initials: 'MW', bg: '#2563EB' },
    { name: 'Tonhub',       sub: 'Open source · secure',     initials: 'TH', bg: '#1A1A2E' },
    { name: 'Other wallet', sub: 'Any TON-compatible wallet', initials: '…',  bg: '#374151' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A18' }}>
      {/* Teal header */}
      <div style={{ background: theme.accent, paddingBottom: 44 }}>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button onClick={onBack} style={{ ...nb('rgba(255,255,255,0.3)', 50, '2px 2px 0 rgba(0,0,0,0.2)'), width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 5, fontSize: 20, color: '#0A0A18', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>‹</button>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.5, color: '#0A0A18', lineHeight: 1 }}>Connect Wallet</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(0,0,0,0.4)', letterSpacing: 2, marginTop: 5 }}>CHOOSE YOUR TON WALLET</div>
          </div>
        </div>
      </div>

      {/* Wallet list */}
      <div style={{ background: '#FFFDE9', borderRadius: '26px 26px 0 0', marginTop: -26, paddingTop: 28, minHeight: 520 }}>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {wallets.map((w, i) => (
            <button key={w.name} onClick={handleConnect} disabled={connecting} style={{
              ...nb('#fff', 14, connecting ? '2px 2px 0 #0A0A18' : '4px 4px 0 #0A0A18'),
              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
              gap: 16, padding: '18px', cursor: connecting ? 'wait' : 'pointer',
              opacity: connecting ? 0.7 : 1,
              border: '2px solid #0A0A18',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: w.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, border: '2px solid #0A0A18', boxShadow: '2px 2px 0 #0A0A18' }}>
                {connecting && i === 0 ? '⟳' : w.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{w.name}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', marginTop: 2 }}>{w.sub}</div>
              </div>
              <span style={{ fontSize: 20, color: '#9CA3AF' }}>→</span>
            </button>
          ))}
        </div>

        {/* Non-custodial notice */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ ...nb(`${theme.accent}10`, 10, 'none'), padding: '14px 16px', border: `1.5px solid ${theme.accent}44` }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: theme.accent, letterSpacing: 2, marginBottom: 5 }}>NON-CUSTODIAL</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', lineHeight: 1.8 }}>
              Chace never holds your keys.<br />Your agent wallet is funded by you,<br />controlled by you, revocable any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Onboarding Shell ─────────────────────────────────────────────────────── */
export default function Onboarding({ onConnected }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  // Note: actual "connected" detection happens in App.tsx via useTonAddress
  // This component just manages the UI flow; App.tsx will unmount it when wallet connects
  return (
    <div className="fadein" key={step}>
      {step === 'welcome' && <WelcomeScreen onNext={() => setStep('connect')} />}
      {step === 'connect' && <ConnectScreen onBack={() => setStep('welcome')} />}
    </div>
  );
}
