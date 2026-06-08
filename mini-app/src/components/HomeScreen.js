import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../ThemeContext";
import BalanceCard from "./BalanceCard";
import QuickBtn from "./QuickBtn";
import AgentCard from "./AgentCard";
export default function HomeScreen({ agents, onNew, onRevoke, onChat, onViewAll }) {
    const { theme } = useTheme();
    const active = agents.filter(a => a.status !== 'complete');
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx(BalanceCard, {}), _jsxs("div", { style: { padding: '0 16px' }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 10 }, children: "QUICK ACTIONS" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx(QuickBtn, { label: "DCA", icon: "\u27F3", onClick: () => onNew('dca') }), _jsx(QuickBtn, { label: "LIMIT", icon: "\u2299", onClick: () => onNew('limit') }), _jsx(QuickBtn, { label: "YIELD", icon: "\u25C8", onClick: () => onNew('yield') }), _jsx(QuickBtn, { label: "SWAP", icon: "\u21C4", onClick: () => onNew('swap') })] })] }), _jsxs("div", { style: { padding: '0 16px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, children: [_jsxs("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2 }, children: ["ACTIVE AGENTS (", active.length, ")"] }), _jsx("button", { onClick: onViewAll, style: {
                                    background: 'none', border: 'none',
                                    fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.accent, cursor: 'pointer',
                                }, children: "SEE ALL \u2192" })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: [active.map(a => (_jsx(AgentCard, { agent: a, onRevoke: onRevoke, onChat: onChat }, a.id))), active.length === 0 && (_jsxs("div", { style: {
                                    background: theme.card, border: `2px dashed ${theme.bdr}`,
                                    borderRadius: 8, padding: '32px 16px', textAlign: 'center',
                                }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub, marginBottom: 12 }, children: "NO ACTIVE AGENTS" }), _jsx("button", { onClick: () => onNew('dca'), style: {
                                            background: theme.accent, border: `2px solid ${theme.accent}`,
                                            color: '#fff', padding: '10px 20px',
                                            fontFamily: 'Space Grotesk,sans-serif', fontSize: 13,
                                            fontWeight: 800, cursor: 'pointer', borderRadius: 6,
                                        }, children: "CREATE FIRST AGENT \u2192" })] }))] })] })] }));
}
