import type { Keypair } from "@stellar/stellar-sdk";
import { IssuedAssetId, PublicKeypair } from "@stellar/typescript-wallet-sdk";

import {
  describeStellarSubmitError,
  getUsdcAsset,
  getWallet,
  isValidAssetCode,
  isValidPublicKey,
  submitTransaction,
  type AssetBalance,
} from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";
import type { Trustline } from "@/features/trustlines/types/trustline";

export class InvalidAssetCodeError extends Error {
  constructor() {
    super("Asset code must be 1-12 letters or numbers.");
    this.name = "InvalidAssetCodeError";
  }
}

export class InvalidIssuerError extends Error {
  constructor() {
    super("Enter a valid Stellar issuer address (starts with G).");
    this.name = "InvalidIssuerError";
  }
}

export class TrustlineHasBalanceError extends Error {
  constructor(assetCode: string) {
    super(
      `You still hold a ${assetCode} balance — send or convert it away before removing this trustline.`,
    );
    this.name = "TrustlineHasBalanceError";
  }
}

function buildAsset(assetCode: string, assetIssuer: string): IssuedAssetId {
  if (!isValidAssetCode(assetCode)) throw new InvalidAssetCodeError();
  if (!isValidPublicKey(assetIssuer)) throw new InvalidIssuerError();
  return new IssuedAssetId(assetCode, assetIssuer);
}

/** Every non-native balance line — i.e. every asset this account currently trusts. */
export function toTrustlines(balances: AssetBalance[]): Trustline[] {
  return balances
    .filter(
      (line): line is AssetBalance & { assetCode: string; assetIssuer: string } =>
        line.assetCode !== undefined && line.assetIssuer !== undefined,
    )
    .map((line) => ({
      assetCode: line.assetCode,
      assetIssuer: line.assetIssuer,
      balance: line.balance,
    }));
}

export async function addTrustline(
  network: StellarNetwork,
  signerKeypair: Keypair,
  assetCode: string,
  assetIssuer: string,
): Promise<{ hash: string }> {
  const asset = buildAsset(assetCode, assetIssuer);

  const builder = await getWallet(network)
    .stellar()
    .transaction({ sourceAddress: PublicKeypair.fromPublicKey(signerKeypair.publicKey()) });

  builder.addAssetSupport(asset);

  const transaction = builder.build();
  transaction.sign(signerKeypair);
  await submitTransaction(network, transaction);

  return { hash: transaction.hash().toString("hex") };
}

/**
 * Removes a trustline via changeTrust with limit 0 — Horizon rejects this outright if the
 * balance isn't already zero (op_invalid_limit), so we check client-side first for a message
 * that actually explains what to do, instead of surfacing that raw SDK error.
 */
export async function removeTrustline(
  network: StellarNetwork,
  signerKeypair: Keypair,
  assetCode: string,
  assetIssuer: string,
  currentBalance: string,
): Promise<{ hash: string }> {
  if (Number(currentBalance) > 0) {
    throw new TrustlineHasBalanceError(assetCode);
  }

  const asset = buildAsset(assetCode, assetIssuer);

  const builder = await getWallet(network)
    .stellar()
    .transaction({ sourceAddress: PublicKeypair.fromPublicKey(signerKeypair.publicKey()) });

  builder.removeAssetSupport(asset);

  const transaction = builder.build();
  transaction.sign(signerKeypair);
  await submitTransaction(network, transaction);

  return { hash: transaction.hash().toString("hex") };
}

/** Convenience for the Send USDC flow's one-click trustline prompt. */
export async function addUsdcTrustline(
  network: StellarNetwork,
  signerKeypair: Keypair,
): Promise<{ hash: string }> {
  const usdcAsset = getUsdcAsset(network);
  return addTrustline(network, signerKeypair, usdcAsset.code, usdcAsset.issuer);
}

export function describeTrustlineError(error: unknown): string {
  if (
    error instanceof InvalidAssetCodeError ||
    error instanceof InvalidIssuerError ||
    error instanceof TrustlineHasBalanceError
  ) {
    return error.message;
  }
  return describeStellarSubmitError(error);
}
