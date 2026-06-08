import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import AgentCard from "./AgentCard";
export default function StrategiesScreen({ agents, onRevoke, onChat }) {
    const { theme } = useTheme();
    const [filter, setFilter] = useState('all');
    const list = agents.filter(a => filter === 'all' ? true :
        filter === 'active' ? a.status !== 'complete' :
            a.status === 'complete');
    return (_jsxs("div", { style: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx("div", { style: { display: 'flex', gap: 8 }, children: ['all', 'active', 'done'].map(f => (_jsx("button", { onClick: () => setFilter(f), style: {
                        background: filter === f ? `${theme.accent}18` : theme.card,
                        border: `1.5px solid ${filter === f ? theme.accent : theme.bdr}`,
                        color: filter === f ? theme.accent : theme.sub,
                        padding: '7px 14px', fontFamily: 'Space Mono,monospace',
                        fontSize: 10, fontWeight: 700, letterSpacing: 1,
                        cursor: 'pointer', borderRadius: 4, textTransform: 'uppercase',
                    }, children: f }, f))) }), list.map(a => (_jsx(AgentCard, { agent: a, onRevoke: onRevoke, onChat: onChat }, a.id))), list.length === 0 && (_jsx("div", { style: {
                    textAlign: 'center', padding: '40px 16px',
                    fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub,
                }, children: "NO AGENTS IN THIS FILTER" }))] }));
}
