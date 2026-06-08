/**
 * Mini-app API client — talks to the backend server.
 * In dev: uses VITE_API_URL env var or falls back to localhost:3000.
 * In production: uses the Railway deployment URL.
 */

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

let _walletAddress: string | null = null;
export function setWalletAddress(addr: string | null) { _walletAddress = addr; }

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initData) {
    h["x-telegram-init-data"] = tg.initData;
  } else if (_walletAddress) {
    h["x-wallet-address"] = _walletAddress;
  } else {
    h["x-user-id"] = "12345";
  }
  return h;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiSession {
  id:             string;
  status:         string;
  action:         string;
  fromToken:      string;
  toToken:        string;
  totalAmount:    number;
  swapsCompleted: number;
  swapsTotal:     number;
  nextSwapAt?:    number;
  walletAddress:  string;
  createdAt:      number;
}

export interface ApiSessionDetail extends ApiSession {
  intent:    unknown;
  txHistory: {
    txHash: string; action: string; inputAmount: string;
    outputAmount?: string; timestamp: number; note?: string;
  }[];
  chat: { role: 'user' | 'agent'; content: string; ts: number }[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  health: () => get<{ ok: boolean; balance: string; network: string }>("/api/health"),

  getSessions: (userId: string | number) =>
    get<{ sessions: ApiSession[] }>(`/api/sessions/${userId}`),

  getSession: (userId: string | number, sessionId: string) =>
    get<ApiSessionDetail>(`/api/sessions/${userId}/${sessionId}`),

  chat: (sessionId: string, message: string) =>
    post<{ reply: string }>(`/api/chat/${sessionId}`, { message }),

  revoke: (sessionId: string) =>
    post<{ ok: boolean; message: string }>(`/api/revoke/${sessionId}`),

  launch: (params: {
    type: string; from: string; to: string;
    amount: number; buys?: number; intervalMinutes?: number;
  }) => post<{ ok: boolean; sessionId: string }>("/api/launch", params),
};
