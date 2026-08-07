import { env } from "@/lib/env";
import type { StellarNetwork } from "@/lib/network";

/** Network used until the user picks one explicitly (see src/stores/network-store.ts). */
export const DEFAULT_NETWORK: StellarNetwork = env.NEXT_PUBLIC_STELLAR_NETWORK;

/**
 * Transaction defaults passed to the Wallet SDK's StellarConfiguration. `baseFeeStroops` is
 * the network minimum (1 XLM = 10,000,000 stroops) — under real network load, prefer
 * getRecommendedFee() from src/lib/stellar.ts over assuming this is sufficient.
 */
export const STELLAR_TX_DEFAULTS = {
  baseFeeStroops: 100,
  timeoutSeconds: 30,
} as const;

export const USDC_ASSET_CODE = "USDC";

/** Polling interval for auto-refreshing dashboard queries (balances, sequence, tx history). */
export const AUTO_REFRESH_INTERVAL_MS = 15_000;
