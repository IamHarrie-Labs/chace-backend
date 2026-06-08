import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Agent, AgentType, ChatMessage, LaunchParams, Screen } from "./types";
import { useTheme } from "./ThemeContext";
import { api, setWalletAddress } from "./api";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import "./styles.css";

import NavBar from "./components/NavBar";
import RevokeModal from "./components/RevokeModal";
import HomeScreen from "./components/HomeScreen";
import NewStrategyScreen from "./components/NewStrategyScreen";
import StrategiesScreen from "./components/StrategiesScreen";
import ActivityScreen from "./components/ActivityScreen";
import AgentChatScreen from "./components/AgentChatScreen";

export default function App() {
  const { theme, isDark, toggle } = useTheme();
  const walletAddress = useTonAddress();

  // Sync wallet address into API client
  useEffect(() => { setWalletAddress(walletAddress || null); }, [walletAddress]);

  const [screen, setScreen]           = useState<Screen>('home');
  const [newType, setNewType]         = useState<AgentType>('dca');
  // Always start with empty agents — real data comes from wallet activity only
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [chatAgentId, setChatAgentId] = useState<number | null>(null);
  const [revokeId, setRevokeId]       = useState<number | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [toastKey, setToastKey]       = useState(0);
  const [chatTab, setChatTab]         = useState<'chat' | 'analytics'>('chat');

  const activeCount = agents.filter(a => a.status !== 'complete').length;
  const chatAgent   = agents.find(a => a.id === chatAgentId) ?? null;

  /* ── Poll backend every 30s (only when wallet connected) ── */
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncAgents = useCallback(async () => {
    if (!walletAddress) return; // no wallet = no data to sync
    const liveIds = agents.filter(a => a.sessionId && a.status === 'active').map(a => a.sessionId!);
    if (!liveIds.length) return;
    try {
      const { sessions } = await api.getSessions(walletAddress);
      setAgents(prev => prev.map(a => {
        if (!a.sessionId) return a;
        const live = sessions.find(s => s.id === a.sessionId);
        if (!live) return a;
        const nextMs = live.nextSwapAt ? live.nextSwapAt - Date.now() : 0;
        const nextIn = nextMs > 0
          ? nextMs > 3_600_000 ? `${Math.floor(nextMs/3_600_000)}h` : `${Math.floor(nextMs/60_000)}m`
          : '—';
        return {
          ...a,
          completedBuys: live.swapsCompleted,
          totalBuys:     live.swapsTotal,
          nextIn,
          status: live.status === 'completed' || live.status === 'revoked' ? 'complete' : 'active',
        };
      }));
    } catch { /* backend unreachable */ }
  }, [agents, walletAddress]);

  useEffect(() => {
    pollRef.current = setInterval(syncAgents, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [syncAgents]);

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
    setChatTab('chat');  // always open on chat tab
    setScreen('chat');
  }

  function handleOpenAnalytics(id: number) {
    setChatAgentId(id);
    setChatTab('analytics');  // open directly on analytics tab
    setScreen('chat');
  }

  function handleAddMessage(agentId: number, msg: ChatMessage) {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, chat: [...a.chat, msg] } : a));
  }

  async function handleLaunch(params: LaunchParams) {
    const { type, name, from, to, amt, buys, freq, lp, service } = params;
    const freqToMinutes: Record<string, number> = { hourly: 60, daily: 1440, weekly: 10080 };

    const autoTitle = type === 'dca'   ? `${from} → ${to} DCA`
                    : type === 'limit' ? `Buy ${from} < $${lp}`
                    : type === 'yield' ? `${from} Yield`
                    : `${service ?? 'Bills'} Auto-Pay`;

    const subs: Record<AgentType, string> = {
      dca:   `${(parseFloat(amt || '0') / buys).toFixed(2)} ${from} × ${buys} · ${freq}`,
      limit: 'Limit order · monitoring',
      yield: 'Auto-compounding',
      bills: `${service} · monthly · ${amt} TON`,
    };

    const initMsg = type === 'dca'   ? `DCA agent deployed. Buying ${(parseFloat(amt||'0')/buys).toFixed(2)} ${from} → ${to} every ${freq}, ${buys} times.`
                  : type === 'limit' ? `Limit agent online. Watching ${from}/USD. I'll trigger below $${lp}.`
                  : type === 'yield' ? `Yield agent active. Auto-compounding your ${from} position.`
                  : `Bills agent ready. Auto-paying ${service} monthly via Bitrefill.`;

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
          setAgents(prev => prev.map(a => a.id === localId ? { ...a, sessionId: res.sessionId } : a));
        }
      } catch (err) { console.warn('[launch] Backend unavailable:', err); }
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

  const DARK_NAVY = '#0A0A18';

  return (
    <div className="shell" style={{ background: theme.bg }}>
      {screen === 'chat' && chatAgent ? (
        <AgentChatScreen
          agent={chatAgent}
          walletAddress={walletAddress}
          initialTab={chatTab}
          onAddMessage={handleAddMessage}
          onBack={() => goTo('strategies')}
          onRevoke={setRevokeId}
          isDark={isDark}
          onToggleTheme={toggle}
        />
      ) : (
        <div className="content-scroll">
          <div key={screen} className="screen-in">
            {screen === 'home' && (
              <HomeScreen
                agents={agents}
                onNew={handleNew}
                onRevoke={setRevokeId}
                onChat={handleOpenChat}
                onAnalytics={handleOpenAnalytics}
                onViewAll={() => goTo('strategies')}
                onActivity={() => goTo('activity')}
                walletAddress={walletAddress}
                isDark={isDark}
                onToggleTheme={toggle}
              />
            )}
            {screen === 'new' && (
              <NewStrategyScreen
                initialType={newType}
                onLaunch={handleLaunch}
                onBack={() => goTo('home')}
              />
            )}
            {screen === 'strategies' && (
              <StrategiesScreen
                agents={agents}
                onRevoke={setRevokeId}
                onChat={handleOpenChat}
                onAnalytics={handleOpenAnalytics}
                onBack={() => goTo('home')}
              />
            )}
            {screen === 'activity' && (
              <ActivityScreen
                walletAddress={walletAddress}
                onBack={() => goTo('home')}
              />
            )}
          </div>
        </div>
      )}

      {screen !== 'chat' && (
        <NavBar screen={screen} onNav={handleNav} agentCount={activeCount} />
      )}

      {revokeId !== null && (
        <RevokeModal onCancel={() => setRevokeId(null)} onConfirm={confirmRevoke} />
      )}

      {toast && (
        <div key={toastKey} className="toast-enter" style={{
          position: 'absolute', top: 16, left: 20, right: 20, zIndex: 200,
          background: DARK_NAVY,
          border: `2px solid ${DARK_NAVY}`,
          boxShadow: `4px 4px 0 ${theme.accent}`,
          borderRadius: 50,
          padding: '14px 22px',
          fontFamily: 'Space Mono, monospace',
          fontSize: 11, fontWeight: 700,
          color: theme.accent,
          textAlign: 'center', letterSpacing: 0.5,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
