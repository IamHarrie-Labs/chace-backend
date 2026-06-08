import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../ThemeContext";
export default function BalanceCard() {
    const { theme } = useTheme();
    return (_jsxs("div", { style: {
            background: theme.card,
            border: `2px solid ${theme.accent}`,
            boxShadow: `4px 4px 0 ${theme.accent}44`,
            borderRadius: 8,
            padding: '20px 20px 16px',
            margin: '0 16px',
        }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, letterSpacing: 2, marginBottom: 8 }, children: "AGENT WALLET" }), _jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 8 }, children: [_jsx("span", { style: { fontSize: 38, fontWeight: 800, letterSpacing: -2, color: theme.text, lineHeight: 1 }, children: "247.83" }), _jsx("span", { style: { fontSize: 17, fontWeight: 700, color: theme.accent }, children: "TON" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 8 }, children: [_jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.sub }, children: "\u2248 $1,204.87 USD" }), _jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent }, children: "\u2191 +2.4% today" })] }), _jsx("div", { style: { marginTop: 14, height: 2, background: theme.dim, borderRadius: 1 }, children: _jsx("div", { style: { width: '62%', height: '100%', background: theme.accent, borderRadius: 1 } }) })] }));
}
