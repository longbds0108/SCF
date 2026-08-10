import { Memo, type Keypair } from "@stellar/stellar-sdk";
import { NativeAssetId, PublicKeypair } from "@stellar/typescript-wallet-sdk";

import {
  accountExists,
  assertMemoRequirementSatisfied,
  describeStellarSubmitError,
  getWallet,
  isValidMuxedPublicKey,
  submitTransaction,
} from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";

/** Stellar's base reserve — a new account must be created with at least this much XLM. */
const MIN_CREATE_ACCOUNT_BALANCE_XLM = 1;

export interface SendXlmPreview {
  destination: string;
  amount: string;
  memo?: string;
  willCreateAccount: boolean;
}

export class DestinationRequiresMinimumBalanceError extends Error {
  constructor() {
    super(
      `This destination account doesn't exist yet — sending XLM to a new account requires ` +
        `at least ${MIN_CREATE_ACCOUNT_BALANCE_XLM} XLM to create it.`,
    );
    this.name = "DestinationRequiresMinimumBalanceError";
  }
}

/**
 * Checks whether the destination exists, which determines payment vs. create-account. Muxed
 * (M...) destinations always route to an existing base account — there's no "create it" concept
 * for them — so that check is skipped entirely rather than resolved to the base account.
 */
async function checkDestination(
  network: StellarNetwork,
  values: SendPaymentFormValues,
): Promise<{ willCreateAccount: boolean }> {
  if (isValidMuxedPublicKey(values.destination)) {
    return { willCreateAccount: false };
  }

  const willCreateAccount = !(await accountExists(network, values.destination));
  if (willCreateAccount && Number(values.amount) < MIN_CREATE_ACCOUNT_BALANCE_XLM) {
    throw new DestinationRequiresMinimumBalanceError();
  }
  return { willCreateAccount };
}

/**
 * Read-only step: checks whether the destination exists (which determines payment vs.
 * create-account) and returns a display-ready preview. Builds nothing yet — the actual
 * transaction is built fresh in sendXlm() right before signing, so its sequence number and
 * timebounds are as current as possible instead of going stale while the user reviews.
 */
export async function previewSendXlm(
  network: StellarNetwork,
  values: SendPaymentFormValues,
): Promise<SendXlmPreview> {
  const { willCreateAccount } = await checkDestination(network, values);
  await assertMemoRequirementSatisfied(network, values.destination, values.memo);

  return {
    destination: values.destination,
    amount: values.amount,
    memo: values.memo.trim() || undefined,
    willCreateAccount,
  };
}

/** Builds, signs, and submits the payment. Re-checks the destination fresh — see previewSendXlm. */
export async function sendXlm(
  network: StellarNetwork,
  signerKeypair: Keypair,
  values: SendPaymentFormValues,
): Promise<{ hash: string }> {
  const destination = values.destination;
  const { willCreateAccount } = await checkDestination(network, values);
  await assertMemoRequirementSatisfied(network, destination, values.memo);

  const builder = await getWallet(network)
    .stellar()
    .transaction({ sourceAddress: PublicKeypair.fromPublicKey(signerKeypair.publicKey()) });

  if (values.memo.trim()) {
    builder.setMemo(Memo.text(values.memo.trim()));
  }

  if (willCreateAccount) {
    builder.createAccount(PublicKeypair.fromPublicKey(destination), Number(values.amount));
  } else {
    builder.transfer(destination, new NativeAssetId(), values.amount);
  }

  const transaction = builder.build();
  transaction.sign(signerKeypair);

  // Resolves true on success; throws TransactionSubmitFailedError otherwise — there's no
  // false-but-not-thrown case per the Wallet SDK's contract, so the return value itself
  // carries no extra information once we get past the await.
  await submitTransaction(network, transaction);

  return { hash: transaction.hash().toString("hex") };
}

/** Maps a caught error to a message safe to show the user. */
export function describeSendXlmError(error: unknown): string {
  if (error instanceof DestinationRequiresMinimumBalanceError) {
    return error.message;
  }
  return describeStellarSubmitError(error);
}
