import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { TOKENS } from "../types";
import { useTheme } from "../ThemeContext";
const TYPE_CARDS = [
    { id: 'dca', label: 'DCA', desc: 'Buy at average price over time' },
    { id: 'limit', label: 'Limit Order', desc: 'Buy when price hits your target' },
    { id: 'yield', label: 'Yield', desc: 'Auto-compound staking rewards' },
];
export default function NewStrategyScreen({ initialType, onLaunch }) {
    const { theme } = useTheme();
    const [step, setStep] = useState(1);
    const [type, setType] = useState(initialType);
    const [from, setFrom] = useState('TON');
    const [to, setTo] = useState('USDT');
    const [amt, setAmt] = useState('30');
    const [buys, setBuys] = useState(6);
    const [freq, setFreq] = useState('daily');
    const [lp, setLp] = useState('3.80');
    const usd = (parseFloat(amt || '0') * 4.87).toFixed(2);
    const inputStyle = {
        width: '100%', background: theme.card, border: `1.5px solid ${theme.bdr}`,
        color: theme.text, fontFamily: 'Space Grotesk,sans-serif',
        fontSize: 20, fontWeight: 700, borderRadius: 6, outline: 'none',
        padding: '10px 56px 10px 14px', boxSizing: 'border-box',
    };
    const selectStyle = {
        flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`,
        color: theme.text, padding: '10px 12px',
        fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', borderRadius: 6, outline: 'none',
    };
    return (_jsxs("div", { style: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }, children: [_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [1, 2, 3].map((s, i) => (_jsxs(React.Fragment, { children: [_jsx("div", { style: {
                                width: 26, height: 26, borderRadius: 4, flexShrink: 0,
                                border: `2px solid ${s <= step ? theme.accent : theme.bdr}`,
                                background: s < step ? theme.accent : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Space Mono,monospace', fontSize: 10, fontWeight: 700,
                                color: s < step ? '#fff' : s === step ? theme.accent : theme.sub,
                            }, children: s < step ? '✓' : s }), i < 2 && _jsx("div", { style: { flex: 1, height: 1, background: s < step ? theme.accent : theme.bdr } })] }, s))) }), step === 1 && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 10 }, children: "CHOOSE STRATEGY" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: TYPE_CARDS.map(opt => (_jsxs("button", { onClick: () => setType(opt.id), style: {
                                        background: type === opt.id ? `${theme.accent}12` : theme.card,
                                        border: `1.5px solid ${type === opt.id ? theme.accent : theme.bdr}`,
                                        boxShadow: type === opt.id ? `3px 3px 0 ${theme.accent}33` : 'none',
                                        borderRadius: 8, padding: '14px 16px', textAlign: 'left',
                                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 14, fontWeight: 700, color: type === opt.id ? theme.accent : theme.text, marginBottom: 3 }, children: opt.label }), _jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }, children: opt.desc })] }), _jsx("div", { style: { width: 10, height: 10, borderRadius: '50%', background: type === opt.id ? theme.accent : theme.dim, flexShrink: 0 } })] }, opt.id))) })] }), _jsx("button", { onClick: () => setStep(2), style: {
                            background: theme.accent, border: `2px solid ${theme.accent}`,
                            color: '#fff', padding: '14px', borderRadius: 8,
                            fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                        }, children: "CONTINUE \u2192" })] })), step === 2 && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }, children: "TOKEN PAIR" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("select", { value: from, onChange: e => setFrom(e.target.value), style: selectStyle, children: TOKENS.map(t => _jsx("option", { children: t }, t)) }), _jsx("span", { style: { color: theme.sub, fontSize: 18, flexShrink: 0 }, children: "\u2192" }), _jsx("select", { value: to, onChange: e => setTo(e.target.value), style: selectStyle, children: TOKENS.filter(t => t !== from).map(t => _jsx("option", { children: t }, t)) })] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }, children: "TOTAL AMOUNT" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: "number", value: amt, onChange: e => setAmt(e.target.value), style: inputStyle }), _jsx("span", { style: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }, children: from })] }), _jsxs("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub, marginTop: 5 }, children: ["\u2248 $", usd, " USD"] })] }), type === 'dca' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }, children: "NUMBER OF BUYS" }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: [3, 6, 12, 24].map(n => (_jsx("button", { onClick: () => setBuys(n), style: {
                                                        flex: 1, background: buys === n ? `${theme.accent}18` : theme.card,
                                                        border: `1.5px solid ${buys === n ? theme.accent : theme.bdr}`,
                                                        color: buys === n ? theme.accent : theme.text,
                                                        padding: '10px 4px', fontFamily: 'Space Mono,monospace',
                                                        fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 6,
                                                    }, children: n }, n))) })] }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }, children: "FREQUENCY" }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: ['hourly', 'daily', 'weekly'].map(f => (_jsx("button", { onClick: () => setFreq(f), style: {
                                                        flex: 1, background: freq === f ? `${theme.accent}18` : theme.card,
                                                        border: `1.5px solid ${freq === f ? theme.accent : theme.bdr}`,
                                                        color: freq === f ? theme.accent : theme.text,
                                                        padding: '10px 4px', fontFamily: 'Space Mono,monospace',
                                                        fontSize: 9, fontWeight: 700, letterSpacing: 1,
                                                        cursor: 'pointer', borderRadius: 6, textTransform: 'uppercase',
                                                    }, children: f }, f))) })] })] })), type === 'limit' && (_jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, letterSpacing: 2, marginBottom: 8 }, children: "BUY BELOW PRICE (USD)" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: "number", value: lp, onChange: e => setLp(e.target.value), style: inputStyle }), _jsx("span", { style: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Space Mono,monospace', fontSize: 11, color: theme.accent, fontWeight: 700 }, children: "USD" })] })] }))] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { onClick: () => setStep(1), style: {
                                    flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
                                    padding: '13px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8,
                                }, children: "\u2190 BACK" }), _jsx("button", { onClick: () => setStep(3), style: {
                                    flex: 2, background: theme.accent, border: `2px solid ${theme.accent}`,
                                    color: '#fff', padding: '13px',
                                    fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer', borderRadius: 8,
                                }, children: "REVIEW \u2192" })] })] })), step === 3 && (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                            background: theme.card, border: `1.5px solid ${theme.accent}`,
                            boxShadow: `4px 4px 0 ${theme.accent}33`, borderRadius: 8, padding: '16px',
                        }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.accent, letterSpacing: 2, marginBottom: 14 }, children: "REVIEW STRATEGY" }), [
                                ['Type', type === 'dca' ? 'Dollar Cost Average' : type === 'limit' ? 'Limit Order' : 'Yield Farming'],
                                ['Pair', `${from} → ${to}`],
                                ['Amount', `${amt} ${from}  (≈ $${usd})`],
                                ...(type === 'dca' ? [
                                    ['Buys', `${buys} × ${(parseFloat(amt || '0') / buys).toFixed(2)} ${from}`],
                                    ['Freq', freq],
                                ] : type === 'limit' ? [
                                    ['Trigger', `${from} < $${lp}`],
                                ] : []),
                            ].map(([k, v]) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${theme.bdr}` }, children: [_jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.sub }, children: k }), _jsx("span", { style: { fontFamily: 'Space Mono,monospace', fontSize: 10, color: theme.text, fontWeight: 700 }, children: v })] }, k))), _jsxs("div", { style: { background: `${theme.accent}10`, border: `1px solid ${theme.accent}33`, borderRadius: 6, padding: '12px', marginTop: 14 }, children: [_jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 8, color: theme.accent, letterSpacing: 2, marginBottom: 5 }, children: "AGENT WALLET FUNDED WITH" }), _jsxs("div", { style: { fontSize: 20, fontWeight: 800, color: theme.accent }, children: [amt, " ", from] }), _jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub, marginTop: 4, lineHeight: 1.5 }, children: "Revoke at any time to reclaim unused funds." })] })] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { onClick: () => setStep(2), style: {
                                    flex: 1, background: theme.card, border: `1.5px solid ${theme.bdr}`, color: theme.sub,
                                    padding: '13px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8,
                                }, children: "\u2190 BACK" }), _jsx("button", { onClick: () => onLaunch({ type, from, to, amt, buys, freq, lp }), style: {
                                    flex: 2, background: theme.accent, border: `2px solid ${theme.accent}`,
                                    color: '#fff', padding: '13px',
                                    fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer', borderRadius: 8,
                                }, children: "FUND + LAUNCH \u27F3" })] })] }))] }));
}
