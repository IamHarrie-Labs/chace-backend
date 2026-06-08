export const SEED_AGENTS = [
    {
        id: 1,
        type: 'dca',
        title: 'TON → USDT DCA',
        subtitle: '5 TON × 6 buys · daily',
        completedBuys: 3,
        totalBuys: 6,
        nextIn: '2h 14m',
        amount: '15 TON remaining',
        status: 'active',
        chat: [
            {
                id: 'c1', role: 'agent',
                text: "DCA agent online. I'm buying 5 TON → USDT every 24h. 3 of 6 buys done. Next buy in 2h 14m.",
                ts: Date.now() - 3600000,
            },
        ],
    },
    {
        id: 2,
        type: 'limit',
        title: 'Buy TON < $3.80',
        subtitle: 'Limit order · monitoring',
        completedBuys: 0,
        totalBuys: 0,
        nextIn: '—',
        amount: '25 TON locked',
        status: 'active',
        chat: [
            {
                id: 'c1', role: 'agent',
                text: "Limit agent online. Watching TON/USD. Current price: $4.87. I'll trigger when it drops below $3.80.",
                ts: Date.now() - 7200000,
            },
        ],
    },
    {
        id: 3,
        type: 'dca',
        title: 'ETH → USDT DCA',
        subtitle: '0.03 ETH × 4 buys · daily',
        completedBuys: 4,
        totalBuys: 4,
        nextIn: '—',
        amount: '0.12 ETH · complete',
        status: 'complete',
        chat: [
            {
                id: 'c1', role: 'agent',
                text: 'All 4 DCA buys complete. Strategy finished. Your funds have been distributed into USDT.',
                ts: Date.now() - 86400000,
            },
        ],
    },
];
export const MOCK_ACTIVITY = [
    { id: 1, label: 'DCA', type: 'DCA Buy', pair: 'TON → USDT', amt: '5 TON', time: '2h ago', status: 'done' },
    { id: 2, label: 'DCA', type: 'DCA Buy', pair: 'TON → USDT', amt: '5 TON', time: '1d ago', status: 'done' },
    { id: 3, label: 'LMT', type: 'Limit Watch', pair: 'TON / USDT', amt: '25 TON', time: '2d ago', status: 'pending' },
    { id: 4, label: 'DCA', type: 'DCA Buy', pair: 'TON → USDT', amt: '5 TON', time: '3d ago', status: 'done' },
    { id: 5, label: 'FND', type: 'Agent Funded', pair: 'TON', amt: '30 TON', time: '3d ago', status: 'done' },
    { id: 6, label: 'RVK', type: 'Revoked', pair: 'ETH → USDT', amt: '0.1 ETH', time: '5d ago', status: 'revoked' },
    { id: 7, label: 'DCA', type: 'DCA Buy', pair: 'ETH → USDT', amt: '0.03 ETH', time: '6d ago', status: 'done' },
];
