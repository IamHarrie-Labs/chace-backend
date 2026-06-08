/**
 * SQLite persistence layer.
 * Stores agent sessions and chat history so they survive restarts.
 */

import Database from "better-sqlite3";
import { join } from "path";
import type { AgentSession, TxRecord } from "./types.js";

const DB_PATH = join(process.cwd(), "chace.db");
const db = new Database(DB_PATH);

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id            TEXT PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    chat_id       INTEGER NOT NULL,
    status        TEXT NOT NULL DEFAULT 'active',
    intent_json   TEXT NOT NULL,
    wallet_json   TEXT NOT NULL,
    swaps_done    INTEGER NOT NULL DEFAULT 0,
    swaps_total   INTEGER NOT NULL DEFAULT 1,
    next_swap_at  INTEGER,
    mnemonic_json TEXT NOT NULL,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE IF NOT EXISTS tx_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL REFERENCES sessions(id),
    tx_hash     TEXT NOT NULL,
    action      TEXT NOT NULL,
    input_amt   TEXT NOT NULL,
    output_amt  TEXT,
    note        TEXT,
    ts          INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL REFERENCES sessions(id),
    role        TEXT NOT NULL CHECK(role IN ('user','agent')),
    content     TEXT NOT NULL,
    ts          INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_tx_session    ON tx_history(session_id);
  CREATE INDEX IF NOT EXISTS idx_chat_session  ON chat_messages(session_id);
`);

// ── Sessions ──────────────────────────────────────────────────────────────────

const stmts = {
  insertSession: db.prepare(`
    INSERT INTO sessions (id, user_id, chat_id, status, intent_json, wallet_json,
      swaps_done, swaps_total, next_swap_at, mnemonic_json)
    VALUES (@id, @userId, @chatId, @status, @intentJson, @walletJson,
      @swapsDone, @swapsTotal, @nextSwapAt, @mnemonicJson)
  `),

  updateSession: db.prepare(`
    UPDATE sessions SET
      status       = @status,
      swaps_done   = @swapsDone,
      next_swap_at = @nextSwapAt,
      wallet_json  = @walletJson
    WHERE id = @id
  `),

  getSession: db.prepare(`SELECT * FROM sessions WHERE id = ?`),

  getUserSessions: db.prepare(`
    SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC
  `),

  getAllActiveSessions: db.prepare(`SELECT * FROM sessions WHERE status = 'active'`),

  insertTx: db.prepare(`
    INSERT INTO tx_history (session_id, tx_hash, action, input_amt, output_amt, note)
    VALUES (@sessionId, @txHash, @action, @inputAmt, @outputAmt, @note)
  `),

  getTxHistory: db.prepare(`
    SELECT * FROM tx_history WHERE session_id = ? ORDER BY ts ASC
  `),

  insertChat: db.prepare(`
    INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)
  `),

  getChatHistory: db.prepare(`
    SELECT * FROM chat_messages WHERE session_id = ? ORDER BY ts ASC
  `),
};

// ── Row → domain type ─────────────────────────────────────────────────────────

function rowToSession(row: any): AgentSession & { mnemonic: string[] } {
  return {
    id:             row.id,
    userId:         row.user_id,
    chatId:         row.chat_id,
    status:         row.status,
    intent:         JSON.parse(row.intent_json),
    wallet:         JSON.parse(row.wallet_json, (k, v) => {
      // bigints are stored as strings with a trailing 'n'
      if (typeof v === 'string' && /^\d+n$/.test(v)) return BigInt(v.slice(0, -1));
      return v;
    }),
    swapsCompleted: row.swaps_done,
    swapsTotal:     row.swaps_total,
    nextSwapAt:     row.next_swap_at ?? undefined,
    txHistory:      [],
    mnemonic:       JSON.parse(row.mnemonic_json),
  };
}

function bigintReplacer(_k: string, v: unknown) {
  return typeof v === 'bigint' ? v.toString() + 'n' : v;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function saveSession(
  session: AgentSession,
  mnemonic: string[]
): void {
  stmts.insertSession.run({
    id:          session.id,
    userId:      session.userId,
    chatId:      session.chatId,
    status:      session.status,
    intentJson:  JSON.stringify(session.intent),
    walletJson:  JSON.stringify(session.wallet, bigintReplacer),
    swapsDone:   session.swapsCompleted,
    swapsTotal:  session.swapsTotal,
    nextSwapAt:  session.nextSwapAt ?? null,
    mnemonicJson: JSON.stringify(mnemonic),
  });
}

export function updateSession(session: AgentSession): void {
  stmts.updateSession.run({
    id:         session.id,
    status:     session.status,
    swapsDone:  session.swapsCompleted,
    nextSwapAt: session.nextSwapAt ?? null,
    walletJson: JSON.stringify(session.wallet, bigintReplacer),
  });
}

export function loadSession(id: string): (AgentSession & { mnemonic: string[] }) | null {
  const row = stmts.getSession.get(id) as any;
  return row ? rowToSession(row) : null;
}

export function loadUserSessions(userId: number): (AgentSession & { mnemonic: string[] })[] {
  const rows = stmts.getUserSessions.all(userId) as any[];
  return rows.map(rowToSession);
}

export function loadAllActiveSessions(): (AgentSession & { mnemonic: string[] })[] {
  const rows = stmts.getAllActiveSessions.all() as any[];
  return rows.map(rowToSession);
}

export function saveTx(sessionId: string, tx: TxRecord): void {
  stmts.insertTx.run({
    sessionId,
    txHash:    tx.txHash,
    action:    tx.action,
    inputAmt:  tx.inputAmount.toString(),
    outputAmt: tx.outputAmount?.toString() ?? null,
    note:      tx.note ?? null,
  });
}

export function loadTxHistory(sessionId: string): TxRecord[] {
  const rows = stmts.getTxHistory.all(sessionId) as any[];
  return rows.map(r => ({
    txHash:       r.tx_hash,
    action:       r.action,
    inputAmount:  BigInt(r.input_amt),
    outputAmount: r.output_amt ? BigInt(r.output_amt) : undefined,
    timestamp:    r.ts,
    note:         r.note ?? undefined,
  }));
}

export function saveChatMessage(sessionId: string, role: 'user' | 'agent', content: string): void {
  stmts.insertChat.run(sessionId, role, content);
}

export function loadChatHistory(sessionId: string): { role: 'user' | 'agent'; content: string; ts: number }[] {
  const rows = stmts.getChatHistory.all(sessionId) as any[];
  return rows.map(r => ({ role: r.role, content: r.content, ts: r.ts }));
}

export { db };
