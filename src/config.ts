import "dotenv/config";

function require_env(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  telegram: {
    botToken: require_env("BOT_TOKEN"),
    miniAppUrl: process.env.MINI_APP_URL ?? "",
  },
  gemini: {
    apiKey: require_env("GEMINI_API_KEY"),
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
  },
  mira: {
    // Mira is a Telegram bot — integrated via deep links, not API calls
    botUsername: "mira",
    skillSlug: process.env.MIRA_SKILL_SLUG ?? "chace",
  },
  ton: {
    network: (process.env.TON_NETWORK ?? "testnet") as "testnet" | "mainnet",
    endpoint: process.env.TON_ENDPOINT ?? "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.TON_API_KEY ?? "",
    masterMnemonic: require_env("MASTER_MNEMONIC").split(" "),
  },
  app: {
    port: Number(process.env.PORT ?? 3000),
    isDev: process.env.NODE_ENV !== "production",
  },
} as const;
