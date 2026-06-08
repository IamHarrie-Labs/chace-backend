import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../ThemeContext";
export default function AgentCard({ agent, onRevoke, onChat }) {
    const { theme } = useTheme();
    const pct = agent.totalBuys > 0 ? (agent.completedBuys / agent.totalBuys) * 100 : 0;
    const isLimit = agent.type === 'limit';
    const isDone = agent.status === 'complete';
    return (_jsxs("div", { onClick: () => onChat(agent.id), style: {
            background: theme.card,
            border: `1.5px solid ${theme.bdr}`,
            borderLeft: `3px solid ${isDone ? theme.dim : theme.accent}`,
            borderRadius: 8, padding: '14px 14px 12px',
            cursor: 'pointer',
            opacity: isDone ? 0.65 : 1,
            transition: 'opacity 0.15s',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }, children: agent.title }), _jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }, children: agent.subtitle })] }), _jsx("span", { style: {
                            background: `${isDone ? theme.dim : theme.accent}22`,
                            border: `1px solid ${isDone ? theme.dim : theme.accent}55`,
                            borderRadius: 3, padding: '3px 8px',
                            fontFamily: 'Space Mono,monospace', fontSize: 9,
                            color: isDone ? theme.sub : theme.accent, letterSpacing: 1,
                        }, children: isDone ? 'DONE' : isLimit ? 'WATCHING' : 'RUNNING' })] }), !isLimit && agent.totalBuys > 0 && (_jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("div", { style: { height: 3, background: theme.dim, borderRadius: 1 }, children: _jsx("div", { style: { width: `${pct}%`, height: '100%', background: theme.accent, borderRadius: 1 } }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 }, children: [_jsxs("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }, children: [agent.completedBuys, "/", agent.totalBuys, " buys done"] }), _jsxs("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }, children: ["Next: ", agent.nextIn] })] })] })), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }, children: agent.amount }), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }, children: "TAP TO CHAT \u2192" }), !isDone && (_jsx("button", { onClick: e => { e.stopPropagation(); onRevoke(agent.id); }, style: {
                                    background: 'transparent', border: `1.5px solid ${theme.red}`, color: theme.red,
                                    padding: '4px 10px', fontFamily: 'Space Mono,monospace',
                                    fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', borderRadius: 3,
                                }, children: "REVOKE" }))] })] })] }));
}
