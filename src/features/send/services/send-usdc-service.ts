import { Memo, type Keypair } from "@stellar/stellar-sdk";
import { PublicKeypair } from "@stellar/typescript-wallet-sdk";

import {
  assertMemoRequirementSatisfied,
  baseAccountId,
  describeStellarSubmitError,
  getUsdcAsset,
  getWallet,
  hasTrustline,
  submitTransaction,
} from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";

export interface SendUsdcPreview {
  destination: string;
  amount: string;
  memo?: string;
}

export class RecipientMissingTrustlineError extends Error {
  constructor() {
    super("This recipient doesn't have a USDC trustline yet, so they can't receive it.");
    this.name = "RecipientMissingTrustlineError";
  }
}

async function assertRecipientCanReceiveUsdc(
  network: StellarNetwork,
  destination: string,
): Promise<void> {
  const usdcAsset = getUsdcAsset(network);
  // Trustlines live on the base account, not on a muxed sub-identity — resolve first.
  const recipientHasTrustline = await hasTrustline(
    network,
    baseAccountId(destination),
    usdcAsset.code,
    usdcAsset.issuer,
  );
  if (!recipientHasTrustline) {
    throw new RecipientMissingTrustlineError();
  }
}

/**
 * Read-only step: confirms the recipient can actually receive USDC (unlike XLM, there's no
 * "create the account" fallback here — a payment operation to an account without the
 * matching trustline fails outright, so this is a hard block, not a warning).
 */
export async function previewSendUsdc(
  network: StellarNetwork,
  values: SendPaymentFormValues,
): Promise<SendUsdcPreview> {
  await assertRecipientCanReceiveUsdc(network, values.destination);
  await assertMemoRequirementSatisfied(network, values.destination, values.memo);

  return {
    destination: values.destination,
    amount: values.amount,
    memo: values.memo.trim() || undefined,
  };
}

/** Builds, signs, and submits the USDC payment. Re-checks the recipient fresh — see previewSendUsdc. */
export async function sendUsdc(
  network: StellarNetwork,
  signerKeypair: Keypair,
  values: SendPaymentFormValues,
): Promise<{ hash: string }> {
  await assertRecipientCanReceiveUsdc(network, values.destination);
  await assertMemoRequirementSatisfied(network, values.destination, values.memo);

  const usdcAsset = getUsdcAsset(network);

  const builder = await getWallet(network)
    .stellar()
    .transaction({ sourceAddress: PublicKeypair.fromPublicKey(signerKeypair.publicKey()) });

  if (values.memo.trim()) {
    builder.setMemo(Memo.text(values.memo.trim()));
  }

  builder.transfer(values.destination, usdcAsset, values.amount);

  const transaction = builder.build();
  transaction.sign(signerKeypair);

  await submitTransaction(network, transaction);

  return { hash: transaction.hash().toString("hex") };
}

export function describeSendUsdcError(error: unknown): string {
  if (error instanceof RecipientMissingTrustlineError) {
    return error.message;
  }
  return describeStellarSubmitError(error);
}
