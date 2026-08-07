import { z } from "zod";

/**
 * Network passphrases are NOT read from env — they're protocol constants sourced directly
 * from `Networks.TESTNET` / `Networks.PUBLIC` in src/lib/network.ts. An editable env var for
 * a value that must exactly match the network would be a footgun: a typo there silently
 * breaks every transaction signature instead of failing at parse time.
 *
 * Horizon/RPC testnet URLs are safe to default here since they're SDF's public endpoints.
 *
 * USDC issuer defaults are Circle's official Stellar addresses — cross-checked against
 * developers.circle.com/stablecoins/usdc-contract-addresses and the example issuer used in
 * @stellar/stellar-sdk's own JSDoc, then validated with StrKey before trusting them. Still
 * overridable via env (e.g. to point at a self-issued test asset) — see .env.example.
 */
const envSchema = z.object({
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  NEXT_PUBLIC_HORIZON_URL_TESTNET: z.string().url().default("https://horizon-testnet.stellar.org"),
  NEXT_PUBLIC_HORIZON_URL_MAINNET: z.string().url().default("https://horizon.stellar.org"),
  NEXT_PUBLIC_SOROBAN_RPC_URL_TESTNET: z
    .string()
    .url()
    .default("https://soroban-testnet.stellar.org"),
  NEXT_PUBLIC_SOROBAN_RPC_URL_MAINNET: z.string().url().optional(),
  NEXT_PUBLIC_USDC_ISSUER_TESTNET: z
    .string()
    .default("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"),
  NEXT_PUBLIC_USDC_ISSUER_MAINNET: z
    .string()
    .default("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_HORIZON_URL_TESTNET: process.env.NEXT_PUBLIC_HORIZON_URL_TESTNET,
  NEXT_PUBLIC_HORIZON_URL_MAINNET: process.env.NEXT_PUBLIC_HORIZON_URL_MAINNET,
  NEXT_PUBLIC_SOROBAN_RPC_URL_TESTNET: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL_TESTNET,
  NEXT_PUBLIC_SOROBAN_RPC_URL_MAINNET: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL_MAINNET,
  NEXT_PUBLIC_USDC_ISSUER_TESTNET: process.env.NEXT_PUBLIC_USDC_ISSUER_TESTNET,
  NEXT_PUBLIC_USDC_ISSUER_MAINNET: process.env.NEXT_PUBLIC_USDC_ISSUER_MAINNET,
});

export type Env = z.infer<typeof envSchema>;
