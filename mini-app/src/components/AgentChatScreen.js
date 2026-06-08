import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../ThemeContext";
const AGENT_PERSONAS = {
    dca: [
        "Still running on schedule. Next buy coming up soon.",
        "DCA is the safest way to accumulate — I'm averaging your cost over time.",
        "I've executed {done} of {total} buys so far. Staying on track.",
        "Dollar-cost averaging removes emotion from buying. I handle the discipline.",
    ],
    limit: [
        "Still watching. Price hasn't hit your target yet.",
        "Patience is the game here. I'll fire the moment the price dips to your target.",
        "Current price is above your limit. I'm monitoring 24/7.",
        "The moment it crosses your threshold, I execute immediately — no delay.",
    ],
    yield: [
        "Compounding daily. Your yield is growing.",
        "Auto-compounding means you earn yield on your yield. Exponential over time.",
        "Pool APY is healthy. Principal is safe.",
        "I reinvest every harvest automatically. No action needed from you.",
    ],
};
function getAgentReply(agent) {
    const lines = AGENT_PERSONAS[agent.type] ?? AGENT_PERSONAS.dca;
    const random = lines[Math.floor(Math.random() * lines.length)];
    return random
        .replace('{done}', String(agent.completedBuys))
        .replace('{total}', String(agent.totalBuys));
}
export default function AgentChatScreen({ agent, onAddMessage }) {
    const { theme } = useTheme();
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [agent.chat]);
    function send() {
        const text = input.trim();
        if (!text)
            return;
        setInput('');
        const userMsg = {
            id: `u-${Date.now()}`,
            role: 'user',
            text,
            ts: Date.now(),
        };
        onAddMessage(agent.id, userMsg);
        setThinking(true);
        // Simulate agent thinking then reply
        setTimeout(() => {
            const agentMsg = {
                id: `a-${Date.now()}`,
                role: 'agent',
                text: getAgentReply(agent),
                ts: Date.now(),
            };
            onAddMessage(agent.id, agentMsg);
            setThinking(false);
        }, 900 + Math.random() * 600);
    }
    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }
    const timeStr = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (_jsxs("div", { style: {
            display: 'flex', flexDirection: 'column', height: '100%',
            background: theme.bg,
        }, children: [_jsxs("div", { style: {
                    padding: '10px 16px 12px',
                    borderBottom: `1px solid ${theme.bdr}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                }, children: [_jsx("div", { style: {
                            width: 36, height: 36, borderRadius: '50%',
                            background: `${theme.accent}18`,
                            border: `1.5px solid ${theme.accent}55`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Space Mono,monospace', fontSize: 10,
                            color: theme.accent, fontWeight: 700,
                        }, children: agent.type === 'dca' ? '⟳' : agent.type === 'limit' ? '⊙' : '◈' }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: theme.text }, children: agent.title }), _jsx("div", { style: { fontFamily: 'Space Mono,monospace', fontSize: 9, color: theme.sub }, children: agent.status === 'active' ? '● online' : '○ complete' })] })] }), _jsxs("div", { style: {
                    flex: 1, overflowY: 'auto', padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    scrollbarWidth: 'none',
                }, children: [agent.chat.map(msg => (_jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            gap: 8, alignItems: 'flex-end',
                        }, children: [msg.role === 'agent' && (_jsx("div", { style: {
                                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                    background: `${theme.accent}20`,
                                    border: `1.5px solid ${theme.accent}55`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, color: theme.accent,
                                }, children: "C" })), _jsxs("div", { style: { maxWidth: '72%' }, children: [_jsx("div", { style: {
                                            padding: '10px 13px',
                                            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                            background: msg.role === 'user' ? theme.accent : theme.card,
                                            border: `1.5px solid ${msg.role === 'user' ? theme.accent : theme.bdr}`,
                                            fontSize: 13, lineHeight: 1.5,
                                            color: msg.role === 'user' ? '#fff' : theme.text,
                                            fontWeight: msg.role === 'user' ? 600 : 400,
                                        }, children: msg.text }), _jsx("div", { style: {
                                            fontFamily: 'Space Mono,monospace', fontSize: 9,
                                            color: theme.sub, marginTop: 3,
                                            textAlign: msg.role === 'user' ? 'right' : 'left',
                                        }, children: timeStr(msg.ts) })] })] }, msg.id))), thinking && (_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'flex-end' }, children: [_jsx("div", { style: {
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: `${theme.accent}20`,
                                    border: `1.5px solid ${theme.accent}55`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, color: theme.accent,
                                }, children: "C" }), _jsx("div", { style: {
                                    padding: '10px 16px',
                                    borderRadius: '14px 14px 14px 4px',
                                    background: theme.card, border: `1.5px solid ${theme.bdr}`,
                                    fontFamily: 'Space Mono,monospace', fontSize: 13,
                                    color: theme.sub, letterSpacing: 3,
                                }, children: "\u00B7\u00B7\u00B7" })] })), _jsx("div", { ref: bottomRef })] }), _jsxs("div", { style: {
                    padding: '10px 12px 16px',
                    borderTop: `1px solid ${theme.bdr}`,
                    background: theme.surf,
                    display: 'flex', gap: 8, alignItems: 'flex-end',
                }, children: [_jsx("textarea", { value: input, onChange: e => setInput(e.target.value), onKeyDown: handleKey, placeholder: "Ask your agent anything\u2026", rows: 1, style: {
                            flex: 1, background: theme.card,
                            border: `1.5px solid ${theme.bdr}`,
                            borderRadius: 10, padding: '10px 12px',
                            fontSize: 13, color: theme.text,
                            fontFamily: 'Space Grotesk,sans-serif',
                            resize: 'none', outline: 'none',
                            lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
                        } }), _jsx("button", { onClick: send, disabled: !input.trim() || thinking, style: {
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: input.trim() && !thinking ? theme.accent : theme.dim,
                            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 17, color: '#fff',
                            transition: 'background 0.15s',
                        }, children: "\u2191" })] })] }));
}
