/**
 * Omniston DEX aggregator (STON.fi) integration.
 * Uses the official @ston-fi/omniston-sdk.
 */

import { Omniston } from "@ston-fi/omniston-sdk";
import { TonClient, WalletContractV4, internal, toNano, fromNano, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell, Cell } from "@ton/core";
import { config } from "./config.js";
import type { SwapQuote } from "./types.js";

const OMNISTON_WS = "wss://omni-ws.ston.fi";

// Omniston runs on mainnet only — always use mainnet token addresses for quotes.
const TOKEN_ADDRESSES: Record<string, string> = {
  TON:  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
  USDT: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  STON: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
  NOT:  "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
  DOGS: "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS",
};

function tokenAssetId(symbol: string) {
  const sym = symbol.toUpperCase();
  if (sym === "TON") {
    return { chain: { $case: "ton" as const, value: { kind: { $case: "native" as const, value: {} } } } };
  }
  const addr = TOKEN_ADDRESSES[sym];
  if (!addr) throw new Error(`Unknown token: ${symbol}. Supported: ${Object.keys(TOKEN_ADDRESSES).join(", ")}`);
  return { chain: { $case: "ton" as const, value: { kind: { $case: "jetton" as const, value: addr } } } };
}

function tonChainAddress(address: string) {
  return { chain: { $case: "ton" as const, value: address } };
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
        console.log("[omniston] event type:", event.$case);

        if (event.$case === "noQuote") {
          clearTimeout(timeout);
          sub.unsubscribe();
          reject(new Error("NO_QUOTE: No market maker responded."));
          return;
        }

        if (event.$case !== "quoteUpdated") return;

        clearTimeout(timeout);
        sub.unsubscribe();

        const q = event.value ?? event;
        // The quoteId is the RFQ id from the ack or the quote itself
        const quoteId: string = q.quoteId ?? q.rfqId ?? q.id ?? `${Date.now()}`;

        resolve({
          quoteId,
          fromToken,
          toToken,
          inputAmount:  BigInt(q.inputUnits  ?? amountNano),
          outputAmount: BigInt(q.outputUnits ?? "0"),
          routerAddress: q.routerAddress ?? q.router_address ?? "",
          poolAddress:   q.poolAddress   ?? q.pool_address   ?? "",
          priceImpact: q.priceImpactBps ? q.priceImpactBps / 100 : 0,
          minOutput:   BigInt(q.minOutputUnits ?? q.outputUnits ?? "0"),
        });
      },
      error: (err: Error) => { clearTimeout(timeout); reject(err); },
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

  const operatorKP   = await mnemonicToPrivateKey(operatorMnemonic);
  const agentContract = WalletContractV4.create({ publicKey: operatorKP.publicKey, workchain: 0 });
  const agentWalletOpen = client.open(agentContract);

  // Use Omniston SDK to build the proper swap transaction
  const omniston = new Omniston({ apiUrl: OMNISTON_WS });

  let messages: { to: Address; value: bigint; body: Cell; bounce: boolean }[];

  try {
    const tonTx = await omniston.tonBuildSwap({
      quoteId: quote.quoteId,
      transferSrcAddress: tonChainAddress(agentAddress),
    });

    messages = tonTx.messages.map(m => ({
      to:     Address.parse(m.targetAddress),
      value:  BigInt(m.sendAmount),
      body:   Cell.fromHex(m.payload),
      bounce: true,
    }));
  } catch (buildErr) {
    // Fallback: hand-craft a basic STON.fi v2 swap message if SDK build fails
    console.warn("[omniston] tonBuildSwap failed, using fallback:", (buildErr as Error).message);
    messages = [{
      to:    Address.parse(quote.routerAddress),
      value: quote.inputAmount + toNano("0.15"),
      body:  beginCell()
               .storeUint(0x25938561, 32)  // swap op
               .storeUint(0, 64)            // query id
               .storeCoins(quote.minOutput)
             .endCell(),
      bounce: true,
    }];
  }

  const seqno = await agentWalletOpen.getSeqno().catch(() => 0);

  await agentWalletOpen.sendTransfer({
    secretKey: operatorKP.secretKey,
    seqno,
    messages: messages.map(m =>
      internal({ to: m.to, value: m.value, bounce: m.bounce, body: m.body })
    ),
  });

  console.log(
    `[omniston] Swap sent: ${fromNano(quote.inputAmount)} ${quote.fromToken} → ` +
    `~${fromNano(quote.outputAmount)} ${quote.toToken}`
  );

  // Return a pseudo tx hash — real hash requires waiting for tx confirmation
  return `${agentAddress.slice(0, 8)}-swap-${Date.now()}`;
}

export function formatQuote(quote: SwapQuote): string {
  const rate = Number(quote.outputAmount) / Number(quote.inputAmount);
  return (
    `${fromNano(quote.inputAmount)} ${quote.fromToken} → ` +
    `~${fromNano(quote.outputAmount)} ${quote.toToken} ` +
    `(rate: ${rate.toFixed(4)}, impact: ${quote.priceImpact.toFixed(2)}%)`
  );
}
