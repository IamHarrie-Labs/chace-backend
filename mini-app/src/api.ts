/**
 * Mini-app API client — talks to the backend server.
 * In dev: uses VITE_API_URL env var or falls back to localhost:3000.
 * In production: uses the Render/Railway deployment URL.
 */

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

let _walletAddress: string | null = null;
export function setWalletAddress(addr: string | null) { _walletAddress = addr; }
export function getWalletAddress(): string | null { return _walletAddress; }

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initData) {
    h["x-telegram-init-data"] = tg.initData;
  } else if (_walletAddress) {
    h["x-wallet-address"] = _walletAddress;
  }
  // No hardcoded fallback — unauthenticated requests return empty data
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

export interface ApiTx {
  txHash:        string;
  action:        string;
  inputAmount:   string;
  outputAmount?: string;
  timestamp:     number;
  note?:         string;
}

export interface ApiSessionDetail extends ApiSession {
  intent:    unknown;
  txHistory: ApiTx[];
  chat: { role: 'user' | 'agent'; content: string; ts: number }[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  health: () => get<{ ok: boolean; balance: string; network: string }>("/api/health"),

  /** Fetch all sessions for the currently connected wallet */
  getSessions: (walletAddressOrId: string | number) =>
    get<{ sessions: ApiSession[] }>(`/api/sessions/${walletAddressOrId}`),

  /** Fetch a single session with full tx history and chat */
  getSession: (walletAddressOrId: string | number, sessionId: string) =>
    get<ApiSessionDetail>(`/api/sessions/${walletAddressOrId}/${sessionId}`),

  chat: (sessionId: string, message: string) =>
    post<{ reply: string }>(`/api/chat/${sessionId}`, { message }),

  revoke: (sessionId: string) =>
    post<{ ok: boolean; message: string }>(`/api/revoke/${sessionId}`),

  launch: (params: {
    type: string; from: string; to: string;
    amount: number; buys?: number; intervalMinutes?: number;
  }) => post<{ ok: boolean; sessionId: string }>("/api/launch", params),
};
