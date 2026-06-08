export type Network = "testnet" | "mainnet";

export type AgentStatus = "pending" | "active" | "paused" | "revoked" | "completed";

export interface AgentWallet {
  address: string;
  masterAddress: string;
  operatorPublicKey: string;
  fundedAmount: bigint;
  spentAmount: bigint;
  status: AgentStatus;
  createdAt: number;
}

export interface ParsedIntent {
  action: "dca" | "swap" | "limit" | "yield" | "unknown";
  fromToken: string;
  toToken: string;
  totalAmount: number;
  splits?: number;
  intervalMinutes?: number;
  limitPrice?: number;
  reasoning: string;
  confidence: number;
}

export interface SwapQuote {
  quoteId: string;      // Omniston quote ID — needed for buildTransfer
  fromToken: string;
  toToken: string;
  inputAmount: bigint;
  outputAmount: bigint;
  routerAddress: string;
  poolAddress: string;
  priceImpact: number;
  minOutput: bigint;
}

export interface AgentSession {
  id: string;
  userId: number;
  chatId: number;
  wallet: AgentWallet;
  intent: ParsedIntent;
  swapsCompleted: number;
  swapsTotal: number;
  nextSwapAt?: number;
  status: AgentStatus;
  txHistory: TxRecord[];
}

export interface TxRecord {
  txHash: string;
  action: string;
  inputAmount: bigint;
  outputAmount?: bigint;
  timestamp: number;
  note?: string;
}
