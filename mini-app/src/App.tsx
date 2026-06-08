import React, { useState, useEffect } from "react";
import type { Agent, AgentType, ChatMessage, LaunchParams, Screen } from "./types";
import { SEED_AGENTS } from "./mockData";
import { useTheme } from "./ThemeContext";
import { api, setWalletAddress } from "./api";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import "./styles.css";

import ChaceMark from "./components/ChaceMark";
import NavBar from "./components/NavBar";
import RevokeModal from "./components/RevokeModal";
import HomeScreen from "./components/HomeScreen";
import NewStrategyScreen from "./components/NewStrategyScreen";
import StrategiesScreen from "./components/StrategiesScreen";
import ActivityScreen from "./components/ActivityScreen";
import AgentChatScreen from "./components/AgentChatScreen";

const SCREEN_TITLES: Record<Screen, string> = {
  home:       'Chace',
  new:        'New Strategy',
  strategies: 'Agents',
  activity:   'Activity',
  chat:       'Agent Chat',
};

export default function App() {
  const { theme, isDark, toggle } = useTheme();
  const walletAddress = useTonAddress();

  // Sync wallet address to API client whenever it changes
  useEffect(() => {
    setWalletAddress(walletAddress || null);
  }, [walletAddress]);

  const [screen, setScreen]           = useState<Screen>('home');
  const [newType, setNewType]         = useState<AgentType>('dca');
  const [agents, setAgents]           = useState<Agent[]>(SEED_AGENTS);
  const [chatAgentId, setChatAgentId] = useState<number | null>(null);
  const [revokeId, setRevokeId]       = useState<number | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [toastKey, setToastKey]       = useState(0);

  const activeCount = agents.filter(a => a.status !== 'complete').length;
  const chatAgent   = agents.find(a => a.id === chatAgentId) ?? null;

  function goTo(s: Screen) { setScreen(s); }

  function handleNav(id: Screen) {
    if (id === 'new') { setNewType('dca'); setScreen('new'); }
    else goTo(id);
  }

  function handleNew(type: AgentType | 'swap') {
    if (type === 'swap') { showToast('Swap coming soon'); return; }
    setNewType(type);
    setScreen('new');
  }

  function handleOpenChat(id: number) {
    setChatAgentId(id);
    setScreen('chat');
  }

  function handleAddMessage(agentId: number, msg: ChatMessage) {
    setAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, chat: [...a.chat, msg] } : a
    ));
  }

  async function handleLaunch(params: LaunchParams) {
    const { type, name, from, to, amt, buys, freq, lp, service } = params;

    const freqToMinutes: Record<string, number> = {
      hourly: 60, daily: 1440, weekly: 10080,
    };

    const autoTitle = type === 'dca'   ? `${from} → ${to} DCA`
                    : type === 'limit' ? `Buy ${from} < $${lp}`
                    : type === 'yield' ? `${from} Yield`
                    : `${service ?? 'Bills'} Auto-Pay`;

    const subs: Record<AgentType, string> = {
      dca:   `${(parseFloat(amt || '0') / buys).toFixed(2)} ${from} × ${buys} buys · ${freq}`,
      limit: 'Limit order · monitoring',
      yield: 'Auto-compounding',
      bills: `${service} · monthly · ${amt} TON`,
    };

    const initMsg = type === 'dca'   ? `DCA agent deployed. Buying ${(parseFloat(amt||'0')/buys).toFixed(2)} ${from} → ${to} every ${freq}, ${buys} times. Tap here to check in.`
                  : type === 'limit' ? `Limit agent online. Watching ${from}/USD. I'll trigger the moment price drops below $${lp}.`
                  : type === 'yield' ? `Yield agent active. Auto-compounding your ${from} position.`
                  : `Bills agent ready. I'll auto-pay your ${service} subscription monthly using TON via Bitrefill.`;

    const localId = Date.now();
    const newAgent: Agent = {
      id: localId, type,
      name: name || undefined,
      title: name || autoTitle,
      subtitle: subs[type],
      completedBuys: 0, totalBuys: type === 'dca' ? buys : 0,
      nextIn: type === 'dca' ? `~1 ${freq}` : '—',
      amount: `${amt} ${type === 'bills' ? 'TON/mo' : `${from} funded`}`,
      status: 'active',
      chat: [{ id: `a-${localId}`, role: 'agent', text: initMsg, ts: localId }],
    };
    setAgents(prev => [newAgent, ...prev]);
    setScreen('home');
    showToast('Launching agent…');

    if (type !== 'bills') {
      try {
        const res = await api.launch({
          type, from, to,
          amount: parseFloat(amt) || 0,
          buys: type === 'dca' ? buys : undefined,
          intervalMinutes: type === 'dca' ? freqToMinutes[freq] : undefined,
        });
        if (res.ok && res.sessionId) {
          setAgents(prev => prev.map(a =>
            a.id === localId ? { ...a, sessionId: res.sessionId } : a
          ));
        }
      } catch (err) {
        console.warn('[launch] Backend unavailable (agent shown locally):', err);
      }
    }

    showToast('Agent launched ⟳');
  }

  function showToast(msg: string) {
    setToast(msg);
    setToastKey(k => k + 1);
    setTimeout(() => setToast(null), 2800);
  }

  function confirmRevoke() {
    const target = agents.find(a => a.id === revokeId);
    setAgents(prev => prev.filter(a => a.id !== revokeId));
    setRevokeId(null);
    if (screen === 'chat') setScreen('strategies');
    showToast('Revoking agent…');
    if (target?.sessionId) {
      api.revoke(target.sessionId)
        .then(() => showToast('Agent revoked — funds returned'))
        .catch(err => showToast(`Revoke error: ${(err as Error).message}`));
    } else {
      showToast('Agent revoked — funds returned');
    }
  }

  const showNav = screen !== 'chat';

  return (
    <div className="shell" style={{ background: theme.bg }}>

      {/* ── Header ── */}
      <div style={{
        background: theme.surf,
        borderBottom: `1px solid ${theme.bdr}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        {screen !== 'home' ? (
          <button
            onClick={() => screen === 'chat' ? goTo('strategies') : goTo('home')}
            style={{
              background: 'none', border: 'none', color: theme.sub,
              fontSize: 24, cursor: 'pointer', padding: '0 4px',
              lineHeight: 1, display: 'flex', alignItems: 'center',
            }}
          >‹</button>
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: `${theme.accent}15`,
            border: `1.5px solid ${theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChaceMark size={18} color={theme.accent} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>
            {SCREEN_TITLES[screen]}
          </div>
          {screen === 'home' && (
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, marginTop: 1 }}>
              {walletAddress
                ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                : 'Autonomous DeFi · online'}
            </div>
          )}
          {screen === 'chat' && chatAgent && (
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, marginTop: 1 }}>
              {chatAgent.title}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {screen === 'home' && (
            <>
              {/* TON Connect button */}
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                <TonConnectButton />
              </div>
              <div style={{
                background: `${theme.accent}15`, border: `1px solid ${theme.accent}44`,
                borderRadius: 4, padding: '3px 8px',
                fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.accent, letterSpacing: 1,
              }}>
                {activeCount} ACTIVE
              </div>
            </>
          )}
          <button onClick={toggle} style={{
            background: theme.card, border: `1.5px solid ${theme.bdr}`,
            borderRadius: 20, padding: '5px 10px',
            cursor: 'pointer', fontSize: 13, lineHeight: 1,
            display: 'flex', alignItems: 'center',
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* ── Screen content ── */}
      {screen === 'chat' && chatAgent ? (
        <AgentChatScreen agent={chatAgent} onAddMessage={handleAddMessage} />
      ) : (
        <div className="content-scroll">
          <div key={screen} className="screen-in" style={{ paddingTop: 16 }}>
            {screen === 'home' && (
              <HomeScreen
                agents={agents}
                onNew={handleNew}
                onRevoke={setRevokeId}
                onChat={handleOpenChat}
                onViewAll={() => goTo('strategies')}
              />
            )}
            {screen === 'new' && (
              <NewStrategyScreen initialType={newType} onLaunch={handleLaunch} />
            )}
            {screen === 'strategies' && (
              <StrategiesScreen agents={agents} onRevoke={setRevokeId} onChat={handleOpenChat} />
            )}
            {screen === 'activity' && <ActivityScreen />}
          </div>
        </div>
      )}

      {showNav && <NavBar screen={screen} onNav={handleNav} agentCount={activeCount} />}

      {revokeId !== null && (
        <RevokeModal onCancel={() => setRevokeId(null)} onConfirm={confirmRevoke} />
      )}

      {toast && (
        <div key={toastKey} className="toast-enter" style={{
          position: 'absolute', top: 70, left: 16, right: 16, zIndex: 200,
          background: theme.accent, borderRadius: 8, padding: '12px 16px',
          fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700,
          color: '#fff', letterSpacing: 0.5, textAlign: 'center',
          boxShadow: `0 4px 16px ${theme.accent}44`,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
