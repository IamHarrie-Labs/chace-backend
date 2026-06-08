/**
 * Agentic Wallet integration via @ton/mcp (MCP server) and direct TON SDK.
 *
 * TON Agentic Wallets (shipped Apr 28 2026):
 *   - Split-key design: user holds master key, agent holds operator key
 *   - Safety model: balance-capped (agent can only spend what's in the wallet)
 *   - Instantly revocable: set operator key to zero address
 *
 * @ton/mcp exposes these as MCP tool calls. We call them via HTTP to the
 * local MCP server process, or fall back to direct TON SDK if needed.
 */

import { TonClient, WalletContractV4, internal, toNano, fromNano } from "@ton/ton";
import { mnemonicToPrivateKey, mnemonicNew, keyPairFromSeed } from "@ton/crypto";
import { Address, beginCell } from "@ton/core";
import { config } from "./config.js";
import type { AgentWallet } from "./types.js";

let _client: TonClient | null = null;

function getClient(): TonClient {
  if (!_client) {
    _client = new TonClient({
      endpoint: config.ton.endpoint,
      apiKey: config.ton.apiKey || undefined,
    });
  }
  return _client;
}

// ── Master wallet (user's main wallet) ──────────────────────────────────────

let _masterKeyPair: Awaited<ReturnType<typeof mnemonicToPrivateKey>> | null = null;

async function getMasterKeyPair() {
  if (!_masterKeyPair) {
    _masterKeyPair = await mnemonicToPrivateKey(config.ton.masterMnemonic);
  }
  return _masterKeyPair;
}

export async function getMasterAddress(): Promise<string> {
  const kp = await getMasterKeyPair();
  const contract = WalletContractV4.create({ publicKey: kp.publicKey, workchain: 0 });
  return contract.address.toString({ testOnly: config.ton.network === "testnet" });
}

export async function getMasterBalance(): Promise<string> {
  const kp = await getMasterKeyPair();
  const contract = WalletContractV4.create({ publicKey: kp.publicKey, workchain: 0 });
  const client = getClient();
  const balance = await client.getBalance(contract.address);
  return fromNano(balance);
}

// ── Agent wallet lifecycle ───────────────────────────────────────────────────

/**
 * Generate a fresh key pair for the agent operator key.
 * The agent will use this to sign transactions from the agentic wallet.
 */
export async function generateOperatorKey() {
  const mnemonic = await mnemonicNew(24);
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  return { mnemonic, keyPair };
}

/**
 * Deploy a new agentic wallet for the agent.
 *
 * NOTE: TON Agentic Wallets use a W5-based contract where the master key
 * can set/revoke operator keys. We approximate this here using a standard
 * wallet that the agent controls, funded by the user. The "revoke" step
 * withdraws remaining funds back to master.
 *
 * When @ton/mcp stabilises, swap this for their deploy_wallet tool call.
 */
export async function deployAgentWallet(fundingAmountTon: number): Promise<AgentWallet> {
  const masterKP = await getMasterKeyPair();
  const client = getClient();

  // Generate fresh operator keys for this agent session
  const { keyPair: operatorKP } = await generateOperatorKey();

  // Create the agent's wallet contract (operator controls this)
  const agentContract = WalletContractV4.create({
    publicKey: operatorKP.publicKey,
    workchain: 0,
  });

  const agentAddress = agentContract.address;

  // Fund the agent wallet from master
  const masterContract = WalletContractV4.create({ publicKey: masterKP.publicKey, workchain: 0 });
  const masterWallet = client.open(masterContract);

  const seqno = await masterWallet.getSeqno();

  await masterWallet.sendTransfer({
    secretKey: masterKP.secretKey,
    seqno,
    messages: [
      internal({
        to: agentAddress,
        value: toNano(fundingAmountTon.toString()),
        bounce: false,
        body: beginCell().storeUint(0, 32).storeStringTail("delegate-fund").endCell(),
      }),
    ],
  });

  console.log(`[wallet] Funded agent wallet ${agentAddress.toString()} with ${fundingAmountTon} TON`);

  return {
    address: agentAddress.toString({ testOnly: config.ton.network === "testnet" }),
    masterAddress: masterContract.address.toString({ testOnly: config.ton.network === "testnet" }),
    operatorPublicKey: operatorKP.publicKey.toString("hex"),
    fundedAmount: toNano(fundingAmountTon.toString()),
    spentAmount: 0n,
    status: "active",
    createdAt: Date.now(),
  };
}

/**
 * Revoke an agent wallet: withdraw all remaining funds back to master.
 * This is the instant kill switch — one transaction, agent is dead.
 */
export async function revokeAgentWallet(
  agentWallet: AgentWallet,
  operatorSecretKey: Buffer
): Promise<string> {
  const client = getClient();
  const masterKP = await getMasterKeyPair();
  const masterContract = WalletContractV4.create({ publicKey: masterKP.publicKey, workchain: 0 });

  const agentAddress = Address.parse(agentWallet.address);
  const agentContractBalance = await client.getBalance(agentAddress);

  if (agentContractBalance === 0n) {
    console.log("[wallet] Agent wallet already empty");
    return "empty";
  }

  // Reconstruct agent wallet contract from operator key
  const operatorKP = { publicKey: Buffer.from(agentWallet.operatorPublicKey, "hex"), secretKey: operatorSecretKey };
  const agentContract = WalletContractV4.create({ publicKey: operatorKP.publicKey, workchain: 0 });
  const agentWalletOpen = client.open(agentContract);

  // The wallet may not be deployed yet (it only receives funds, hasn't sent anything).
  // getSeqno() returns 500 on undeployed contracts — catch and use seqno=0 + send StateInit.
  let seqno = 0;
  let isDeployed = true;
  try {
    seqno = await agentWalletOpen.getSeqno();
  } catch {
    isDeployed = false;
    seqno = 0;
  }

  const gasReserve = toNano("0.08"); // slightly more gas for StateInit deploy
  const sendAmount = agentContractBalance - gasReserve;

  if (isDeployed) {
    await agentWalletOpen.sendTransfer({
      secretKey: operatorKP.secretKey,
      seqno,
      messages: [
        internal({
          to: masterContract.address,
          value: sendAmount,
          bounce: false,
          body: beginCell().storeUint(0, 32).storeStringTail("delegate-revoke").endCell(),
        }),
      ],
    });
  } else {
    // Wallet not yet deployed — send with StateInit to deploy + transfer in one tx
    await agentWalletOpen.sendTransfer({
      secretKey: operatorKP.secretKey,
      seqno: 0,
      messages: [
        internal({
          to: masterContract.address,
          value: sendAmount,
          bounce: false,
          body: beginCell().storeUint(0, 32).storeStringTail("delegate-revoke").endCell(),
        }),
      ],
      sendMode: (1 | 2) as 1,  // PAY_GAS_SEPARATELY | IGNORE_ERRORS
    });
  }

  console.log(`[wallet] Revoked — withdrew ${fromNano(sendAmount)} TON back to master`);
  return fromNano(sendAmount);
}

export async function getAgentBalance(agentAddress: string): Promise<string> {
  const client = getClient();
  const addr = Address.parse(agentAddress);
  const balance = await client.getBalance(addr);
  return fromNano(balance);
}
