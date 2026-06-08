import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../ThemeContext";
export default function RevokeModal({ onCancel, onConfirm }) {
    const { theme } = useTheme();
    return (_jsx("div", { onClick: onCancel, style: {
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'flex-end', zIndex: 100,
        }, children: _jsxs("div", { onClick: e => e.stopPropagation(), style: {
                background: theme.surf,
                border: `2px solid ${theme.red}`,
                boxShadow: `0 -4px 24px ${theme.red}22`,
                borderRadius: '12px 12px 0 0',
                padding: '24px 20px 40px', width: '100%',
            }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.red, letterSpacing: 2, marginBottom: 10 }, children: "REVOKE AGENT" }), _jsx("div", { style: { fontSize: 16, color: theme.text, fontWeight: 700, marginBottom: 6 }, children: "Stop this agent and reclaim funds?" }), _jsxs("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, lineHeight: 1.7, marginBottom: 22 }, children: ["Any unfilled orders will be cancelled.", _jsx("br", {}), "Your tokens return immediately."] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { onClick: onCancel, style: {
                                flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
                                padding: '13px', fontFamily: 'Space Grotesk,sans-serif',
                                fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 6,
                            }, children: "CANCEL" }), _jsx("button", { onClick: onConfirm, style: {
                                flex: 1, background: theme.red, border: `2px solid ${theme.red}`, color: '#fff',
                                padding: '13px', fontFamily: 'Space Grotesk,sans-serif',
                                fontSize: 14, fontWeight: 800, cursor: 'pointer', borderRadius: 6,
                            }, children: "REVOKE" })] })] }) }));
}
