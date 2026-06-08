import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useTheme } from "../ThemeContext";
import { MOCK_ACTIVITY } from "../mockData";
export default function ActivityScreen({}) {
    const { theme } = useTheme();
    const txs = MOCK_ACTIVITY;
    const col = {
        done: theme.accent,
        pending: '#D4930A',
        revoked: theme.red,
    };
    return (_jsxs("div", { style: { padding: '0 16px' }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 14 }, children: "RECENT ACTIVITY" }), txs.map((tx, i) => (_jsxs(React.Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }, children: [_jsx("div", { style: {
                                    width: 40, height: 40, flexShrink: 0,
                                    background: `${col[tx.status]}15`,
                                    border: `1.5px solid ${col[tx.status]}44`,
                                    borderRadius: 6,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'Space Mono,monospace', fontSize: 8,
                                    color: col[tx.status], fontWeight: 700,
                                }, children: tx.label }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 600, color: theme.text }, children: tx.type }), _jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.text, fontWeight: 700 }, children: tx.amt })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 2 }, children: [_jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }, children: tx.pair }), _jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }, children: tx.time })] })] })] }), i < txs.length - 1 && _jsx("div", { style: { height: 1, background: theme.bdr } })] }, tx.id)))] }));
}
