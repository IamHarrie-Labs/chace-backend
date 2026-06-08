// ── Agent / Strategy types ────────────────────────────────────────────────────

export type AgentType = 'dca' | 'limit' | 'yield';

export type AgentStatus = 'active' | 'complete';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  ts: number;
}

export interface Agent {
  id: number;
  type: AgentType;
  title: string;
  subtitle: string;
  completedBuys: number;
  totalBuys: number;
  nextIn: string;
  amount: string;
  status: AgentStatus;
  chat: ChatMessage[];
  sessionId?: string;  // backend session UUID, set after /api/launch
}

export interface TxRecord {
  id: number;
  label: string;
  type: string;
  pair: string;
  amt: string;
  time: string;
  status: 'done' | 'pending' | 'revoked';
}

export interface LaunchParams {
  type: AgentType;
  from: string;
  to: string;
  amt: string;
  buys: number;
  freq: string;
  lp: string;
}

export type Screen = 'home' | 'new' | 'strategies' | 'activity' | 'chat';

export const TOKENS = ['TON', 'USDT', 'BTC', 'ETH', 'USDC', 'NOT'];
