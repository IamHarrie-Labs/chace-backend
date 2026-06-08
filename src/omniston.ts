/**
 * Omniston DEX aggregator (STON.fi) integration.
 * Uses the official @ston-fi/omniston-sdk.
 */

import { Omniston, SettlementMethod } from "@ston-fi/omniston-sdk";
import { TonClient, WalletContractV4, internal, toNano, fromNano, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { config } from "./config.js";
import type { SwapQuote } from "./types.js";

const OMNISTON_WS = "wss://omni-ws.ston.fi";

// Omniston runs on mainnet only — always use mainnet token addresses for quotes.
// The actual swap execution uses whichever network is configured.
const TOKEN_ADDRESSES: Record<string, string> = {
  TON:  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
  USDT: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  STON: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
  NOT:  "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
  DOGS: "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS",
};

function tokenAssetId(symbol: string): { chain: { $case: "ton"; value: { kind: { $case: "native"; value: {} } | { $case: "jetton"; value: string } } } } {
  const sym = symbol.toUpperCase();
  if (sym === "TON") {
    return { chain: { $case: "ton", value: { kind: { $case: "native", value: {} } } } };
  }
  const addr = TOKEN_ADDRESSES[sym];
  if (!addr) throw new Error(`Unknown token: ${symbol}. Supported: ${Object.keys(TOKEN_ADDRESSES).join(", ")}`);
  return { chain: { $case: "ton", value: { kind: { $case: "jetton", value: addr } } } };
}

// ── Quote ─────────────────────────────────────────────────────────────────

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amountNano: bigint
): Promise<SwapQuote> {
  const omniston = new Omniston({ apiUrl: OMNISTON_WS });

  return new Promise<SwapQuote>((resolve, reject) => {
    const timeout = setTimeout(() => {
      sub.unsubscribe();
      reject(new Error("Omniston quote timeout after 15s"));
    }, 15_000);

    const sub = omniston.requestForQuote({
      inputAsset: tokenAssetId(fromToken),
      outputAsset: tokenAssetId(toToken),
      amount: { $case: "inputUnits", value: amountNano.toString() },
      settlementParams: [{ params: { $case: "swap", value: {} } }],
    }).subscribe({
      next: (event: any) => {
        const e = event; // events are flat — $case is at top level
        console.log("[omniston] event type:", e.$case);

        if (e.$case === "noQuote") {
          // No market maker responded — valid protocol state, not a code error
          clearTimeout(timeout);
          sub.unsubscribe();
          reject(new Error("NO_QUOTE: No market maker responded. Try again or use a different pair."));
          return;
        }

        if (e.$case !== "quoteUpdated") return; // skip ack, keepAlive

        clearTimeout(timeout);
        sub.unsubscribe();

        const q = e.value ?? e;
        resolve({
          fromToken,
          toToken,
          inputAmount: BigInt(q.inputUnits ?? amountNano),
          outputAmount: BigInt(q.outputUnits ?? "0"),
          routerAddress: q.routerAddress ?? q.router_address ?? "",
          poolAddress: q.poolAddress ?? q.pool_address ?? "",
          priceImpact: q.priceImpactBps ? q.priceImpactBps / 100 : 0,
          minOutput: BigInt(q.minOutputUnits ?? q.outputUnits ?? "0"),
        });
      },
      error: (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      },
    });
  });
}

// ── Execute ───────────────────────────────────────────────────────────────

export async function executeSwap(
  agentAddress: string,
  operatorMnemonic: string[],
  quote: SwapQuote
): Promise<string> {
  const client = new TonClient({
    endpoint: config.ton.endpoint,
    apiKey: config.ton.apiKey || undefined,
  });

  const operatorKP = await mnemonicToPrivateKey(operatorMnemonic);
  const agentContract = WalletContractV4.create({ publicKey: operatorKP.publicKey, workchain: 0 });
  const agentWallet = client.open(agentContract);
  const seqno = await agentWallet.getSeqno();

  const { beginCell } = await import("@ton/core");
  const swapPayload = beginCell()
    .storeUint(0x25938561, 32) // swap op code
    .storeUint(0, 64)          // query id
    .storeCoins(quote.minOutput)
    .endCell();

  await agentWallet.sendTransfer({
    secretKey: operatorKP.secretKey,
    seqno,
    messages: [
      internal({
        to: Address.parse(quote.routerAddress),
        value: quote.inputAmount + toNano("0.1"),
        bounce: true,
        body: swapPayload,
      }),
    ],
  });

  console.log(
    `[omniston] Swap sent: ${fromNano(quote.inputAmount)} ${quote.fromToken} → ` +
    `~${fromNano(quote.outputAmount)} ${quote.toToken}`
  );

  return `${agentAddress}-swap-${Date.now()}`;
}

export function formatQuote(quote: SwapQuote): string {
  const rate = Number(quote.outputAmount) / Number(quote.inputAmount);
  return (
    `${fromNano(quote.inputAmount)} ${quote.fromToken} → ` +
    `~${fromNano(quote.outputAmount)} ${quote.toToken} ` +
    `(rate: ${rate.toFixed(4)}, impact: ${quote.priceImpact.toFixed(2)}%)`
  );
}
