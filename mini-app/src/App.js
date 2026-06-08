import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { SEED_AGENTS } from "./mockData";
import { useTheme } from "./ThemeContext";
import "./styles.css";
import ChaceMark from "./components/ChaceMark";
import NavBar from "./components/NavBar";
import RevokeModal from "./components/RevokeModal";
import HomeScreen from "./components/HomeScreen";
import NewStrategyScreen from "./components/NewStrategyScreen";
import StrategiesScreen from "./components/StrategiesScreen";
import ActivityScreen from "./components/ActivityScreen";
import AgentChatScreen from "./components/AgentChatScreen";
const SCREEN_TITLES = {
    home: 'Chace',
    new: 'New Strategy',
    strategies: 'Agents',
    activity: 'Activity',
    chat: 'Agent Chat',
};
export default function App() {
    const { theme, isDark, toggle } = useTheme();
    const [screen, setScreen] = useState('home');
    const [newType, setNewType] = useState('dca');
    const [agents, setAgents] = useState(SEED_AGENTS);
    const [chatAgentId, setChatAgentId] = useState(null);
    const [revokeId, setRevokeId] = useState(null);
    const [toast, setToast] = useState(null);
    const [toastKey, setToastKey] = useState(0);
    const activeCount = agents.filter(a => a.status !== 'complete').length;
    const chatAgent = agents.find(a => a.id === chatAgentId) ?? null;
    function goTo(s) { setScreen(s); }
    function handleNav(id) {
        if (id === 'new') {
            setNewType('dca');
            setScreen('new');
        }
        else
            goTo(id);
    }
    function handleNew(type) {
        if (type === 'swap') {
            showToast('Swap coming soon');
            return;
        }
        setNewType(type);
        setScreen('new');
    }
    function handleOpenChat(id) {
        setChatAgentId(id);
        setScreen('chat');
    }
    function handleAddMessage(agentId, msg) {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, chat: [...a.chat, msg] } : a));
    }
    function handleLaunch(params) {
        const { type, from, to, amt, buys, freq, lp } = params;
        const titles = {
            dca: `${from} → ${to} DCA`,
            limit: `Buy ${from} < $${lp}`,
            yield: `${from} Yield`,
        };
        const subs = {
            dca: `${(parseFloat(amt || '0') / buys).toFixed(2)} ${from} × ${buys} buys · ${freq}`,
            limit: 'Limit order · monitoring',
            yield: 'Auto-compounding',
        };
        const newAgent = {
            id: Date.now(), type,
            title: titles[type], subtitle: subs[type],
            completedBuys: 0, totalBuys: type === 'dca' ? buys : 0,
            nextIn: type === 'dca' ? `~1 ${freq}` : '—',
            amount: `${amt} ${from} funded`,
            status: 'active',
            chat: [{
                    id: `a-${Date.now()}`, role: 'agent',
                    text: `Agent deployed. I'll ${type === 'dca' ? `DCA ${amt} ${from} into ${to} over ${buys} buys` : type === 'limit' ? `watch for ${from} to drop below $${lp}` : `auto-compound ${from} yield`}. Tap here anytime to check in.`,
                    ts: Date.now(),
                }],
        };
        setAgents(prev => [newAgent, ...prev]);
        setScreen('home');
        showToast('Agent launched ⟳');
    }
    function showToast(msg) {
        setToast(msg);
        setToastKey(k => k + 1);
        setTimeout(() => setToast(null), 2800);
    }
    function confirmRevoke() {
        setAgents(prev => prev.filter(a => a.id !== revokeId));
        setRevokeId(null);
        if (screen === 'chat')
            setScreen('strategies');
        showToast('Agent revoked — funds returned');
    }
    const showNav = screen !== 'chat';
    return (_jsxs("div", { className: "shell", style: { background: theme.bg }, children: [_jsxs("div", { style: {
                    background: theme.surf,
                    borderBottom: `1px solid ${theme.bdr}`,
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    flexShrink: 0,
                }, children: [screen !== 'home' ? (_jsx("button", { onClick: () => screen === 'chat' ? goTo('strategies') : goTo('home'), style: {
                            background: 'none', border: 'none', color: theme.sub,
                            fontSize: 24, cursor: 'pointer', padding: '0 4px',
                            lineHeight: 1, display: 'flex', alignItems: 'center',
                        }, children: "\u2039" })) : (_jsx("div", { style: {
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: `${theme.accent}15`,
                            border: `1.5px solid ${theme.accent}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }, children: _jsx(ChaceMark, { size: 18, color: theme.accent }) })), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 15, fontWeight: 700, color: theme.text, lineHeight: 1.2 }, children: SCREEN_TITLES[screen] }), screen === 'home' && (_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, marginTop: 1 }, children: "Autonomous DeFi \u00B7 online" })), screen === 'chat' && chatAgent && (_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, marginTop: 1 }, children: chatAgent.title }))] }), _jsxs("div", { style: { display: 'flex', gap: 10, alignItems: 'center' }, children: [screen === 'home' && (_jsxs("div", { style: {
                                    background: `${theme.accent}15`, border: `1px solid ${theme.accent}44`,
                                    borderRadius: 4, padding: '3px 8px',
                                    fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.accent, letterSpacing: 1,
                                }, children: [activeCount, " ACTIVE"] })), _jsx("button", { onClick: toggle, style: {
                                    background: theme.card, border: `1.5px solid ${theme.bdr}`,
                                    borderRadius: 20, padding: '5px 10px',
                                    cursor: 'pointer', fontSize: 13, lineHeight: 1,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }, children: _jsx("span", { children: isDark ? '☀️' : '🌙' }) })] })] }), screen === 'chat' && chatAgent ? (_jsx(AgentChatScreen, { agent: chatAgent, onAddMessage: handleAddMessage })) : (_jsx("div", { className: "content-scroll", children: _jsxs("div", { className: "screen-in", style: { paddingTop: 16 }, children: [screen === 'home' && (_jsx(HomeScreen, { agents: agents, onNew: handleNew, onRevoke: setRevokeId, onChat: handleOpenChat, onViewAll: () => goTo('strategies') })), screen === 'new' && (_jsx(NewStrategyScreen, { initialType: newType, onLaunch: handleLaunch })), screen === 'strategies' && (_jsx(StrategiesScreen, { agents: agents, onRevoke: setRevokeId, onChat: handleOpenChat })), screen === 'activity' && _jsx(ActivityScreen, {})] }, screen) })), showNav && (_jsx(NavBar, { screen: screen, onNav: handleNav, agentCount: activeCount })), revokeId !== null && (_jsx(RevokeModal, { onCancel: () => setRevokeId(null), onConfirm: confirmRevoke })), toast && (_jsx("div", { className: "toast-enter", style: {
                    position: 'absolute', top: 70, left: 16, right: 16, zIndex: 200,
                    background: theme.accent,
                    borderRadius: 8, padding: '12px 16px',
                    fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700,
                    color: '#fff', letterSpacing: 0.5, textAlign: 'center',
                    boxShadow: `0 4px 16px ${theme.accent}44`,
                }, children: toast }, toastKey))] }));
}
