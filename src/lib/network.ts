import { Networks } from "@stellar/stellar-sdk";

import { env } from "@/lib/env";

export type StellarNetwork = "testnet" | "mainnet";

export interface NetworkConfig {
  network: StellarNetwork;
  /** Protocol constant from the SDK — never sourced from env, see src/lib/env.ts. */
  networkPassphrase: Networks;
  horizonUrl: string;
  /** Soroban RPC URL. Unset on mainnet unless a paid provider is configured. */
  rpcUrl?: string;
  /** USDC issuer account. Unset until verified against the issuer's stellar.toml. */
  usdcIssuer?: string;
}

const NETWORK_CONFIG: Record<StellarNetwork, NetworkConfig> = {
  testnet: {
    network: "testnet",
    networkPassphrase: Networks.TESTNET,
    horizonUrl: env.NEXT_PUBLIC_HORIZON_URL_TESTNET,
    rpcUrl: env.NEXT_PUBLIC_SOROBAN_RPC_URL_TESTNET,
    usdcIssuer: env.NEXT_PUBLIC_USDC_ISSUER_TESTNET,
  },
  mainnet: {
    network: "mainnet",
    networkPassphrase: Networks.PUBLIC,
    horizonUrl: env.NEXT_PUBLIC_HORIZON_URL_MAINNET,
    rpcUrl: env.NEXT_PUBLIC_SOROBAN_RPC_URL_MAINNET,
    usdcIssuer: env.NEXT_PUBLIC_USDC_ISSUER_MAINNET,
  },
};

export function getNetworkConfig(network: StellarNetwork): NetworkConfig {
  return NETWORK_CONFIG[network];
}

export function isTestnet(network: StellarNetwork): boolean {
  return network === "testnet";
}
