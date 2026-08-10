import {
  Horizon,
  NotFoundError,
  rpc,
  StrKey,
  type FeeBumpTransaction,
  type Transaction,
} from "@stellar/stellar-sdk";
import {
  Exceptions,
  IssuedAssetId,
  StellarConfiguration,
  Wallet,
} from "@stellar/typescript-wallet-sdk";

import { STELLAR_TX_DEFAULTS, USDC_ASSET_CODE } from "@/lib/config";
import { getNetworkConfig, type StellarNetwork } from "@/lib/network";

// ---- Client factories ------------------------------------------------------
//
// One Wallet instance per network, created lazily and cached — the Wallet SDK
// owns the Horizon client (StellarConfiguration constructs it once from our
// env-driven URL), so we read it back through the wallet rather than creating
// a second, disconnected Horizon.Server. The Wallet SDK has no Soroban RPC
// concept, so the RPC client is a separate cache using the raw stellar-sdk.

const wallets = new Map<StellarNetwork, Wallet>();
const rpcServers = new Map<StellarNetwork, rpc.Server>();

export function getWallet(network: StellarNetwork): Wallet {
  const cached = wallets.get(network);
  if (cached) return cached;

  const config = getNetworkConfig(network);
  const wallet = new Wallet({
    stellarConfiguration: new StellarConfiguration({
      network: config.networkPassphrase,
      horizonUrl: config.horizonUrl,
      baseFee: STELLAR_TX_DEFAULTS.baseFeeStroops,
      defaultTimeout: STELLAR_TX_DEFAULTS.timeoutSeconds,
    }),
  });

  wallets.set(network, wallet);
  return wallet;
}

export function getHorizonServer(network: StellarNetwork): Horizon.Server {
  return getWallet(network).stellar().server;
}

export function getRpcServer(network: StellarNetwork): rpc.Server {
  const cached = rpcServers.get(network);
  if (cached) return cached;

  const { rpcUrl } = getNetworkConfig(network);
  if (!rpcUrl) {
    throw new Error(`No Soroban RPC URL configured for "${network}".`);
  }

  const server = new rpc.Server(rpcUrl);
  rpcServers.set(network, server);
  return server;
}

// ---- Validation -------------------------------------------------------------

export function isValidPublicKey(value: string): boolean {
  return StrKey.isValidEd25519PublicKey(value);
}

/** SEP-0023 muxed account address (M...) — routes to a base G... account plus an embedded id. */
export function isValidMuxedPublicKey(value: string): boolean {
  return StrKey.isValidMed25519PublicKey(value);
}

/** Accepts either a plain Stellar account (G...) or a SEP-0023 muxed account (M...). */
export function isValidDestinationAddress(value: string): boolean {
  return isValidPublicKey(value) || isValidMuxedPublicKey(value);
}

/**
 * The underlying G... account a muxed (M...) address routes through. Horizon's account
 * endpoints (existence, balances, trustlines, data entries) only accept base ed25519 keys, so
 * any ledger lookup on a possibly-muxed destination needs to go through this first — the
 * muxed id itself only matters to the payment operation, not to reading ledger state.
 */
export function baseAccountId(destination: string): string {
  if (!isValidMuxedPublicKey(destination)) return destination;
  const decoded = StrKey.decodeMed25519PublicKey(destination);
  return StrKey.encodeEd25519PublicKey(decoded.subarray(0, 32));
}

export function isValidContractId(value: string): boolean {
  return StrKey.isValidContract(value);
}

export function isValidSecretKey(value: string): boolean {
  return StrKey.isValidEd25519SecretSeed(value);
}

/** Stellar asset codes: 1-12 alphanumeric characters (confirmed against Asset's own validation). */
export function isValidAssetCode(value: string): boolean {
  return /^[A-Za-z0-9]{1,12}$/.test(value);
}

// ---- Accounts -----------------------------------------------------------

/**
 * Checks for a Horizon 404 by HTTP status rather than `instanceof NotFoundError`.
 * The Wallet SDK ships its own bundled copy of stellar-sdk's classes; under webpack
 * that copy and the one imported here can end up as two distinct module instances
 * even though npm dedupes them to one file on disk, which silently breaks
 * `instanceof` in the browser (confirmed: works in a plain Node script, fails here).
 * The HTTP status is a plain property on the underlying axios error, so it's
 * immune to that class-identity mismatch entirely.
 */
function isNotFoundError(error: unknown): boolean {
  if (error instanceof NotFoundError) return true;
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}

export class AccountNotFoundError extends Error {
  constructor(network: StellarNetwork) {
    super(
      network === "testnet"
        ? "This account doesn't exist on testnet yet — fund it with Friendbot first."
        : "This account doesn't exist on the network yet — it needs an initial XLM deposit.",
    );
    this.name = "AccountNotFoundError";
  }
}

export async function accountExists(network: StellarNetwork, publicKey: string): Promise<boolean> {
  try {
    await getHorizonServer(network).loadAccount(publicKey);
    return true;
  } catch (error) {
    if (isNotFoundError(error)) return false;
    throw error;
  }
}

export async function loadAccount(
  network: StellarNetwork,
  publicKey: string,
): Promise<Horizon.AccountResponse> {
  try {
    return await getHorizonServer(network).loadAccount(publicKey);
  } catch (error) {
    if (isNotFoundError(error)) throw new AccountNotFoundError(network);
    throw error;
  }
}

const MEMO_REQUIRED_DATA_KEY = "config.memo_required";

export class DestinationRequiresMemoError extends Error {
  constructor() {
    super(
      "This destination requires a memo to identify your payment (SEP-0029) — add one before " +
        "sending, or the recipient may not credit your funds.",
    );
    this.name = "DestinationRequiresMemoError";
  }
}

/**
 * SEP-0029: some destinations (mainly exchange deposit addresses) flag every incoming payment
 * as needing a memo, since they use it to credit the right internal customer — sending without
 * one risks the funds landing but never being credited. A muxed (M...) destination already
 * carries that same identifying information in its embedded id, so it's exempt: specifying one
 * already satisfies the reason this check exists.
 */
export async function assertMemoRequirementSatisfied(
  network: StellarNetwork,
  destination: string,
  memo: string | undefined,
): Promise<void> {
  if (memo?.trim() || isValidMuxedPublicKey(destination)) return;

  let account: Horizon.AccountResponse;
  try {
    account = await loadAccount(network, baseAccountId(destination));
  } catch (error) {
    if (error instanceof AccountNotFoundError) return;
    throw error;
  }

  if (MEMO_REQUIRED_DATA_KEY in account.data_attr) {
    throw new DestinationRequiresMemoError();
  }
}

export interface AssetBalance {
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  balance: string;
}

export function mapAccountBalances(account: Horizon.AccountResponse): AssetBalance[] {
  return account.balances.map((line) => ({
    assetType: line.asset_type,
    assetCode: "asset_code" in line ? line.asset_code : undefined,
    assetIssuer: "asset_issuer" in line ? line.asset_issuer : undefined,
    balance: line.balance,
  }));
}

export async function getBalances(
  network: StellarNetwork,
  publicKey: string,
): Promise<AssetBalance[]> {
  const account = await loadAccount(network, publicKey);
  return mapAccountBalances(account);
}

export function getNativeBalance(balances: AssetBalance[]): string {
  return balances.find((line) => line.assetType === "native")?.balance ?? "0";
}

export function findAssetBalance(
  balances: AssetBalance[],
  assetCode: string,
  assetIssuer: string,
): AssetBalance | undefined {
  return balances.find((line) => line.assetCode === assetCode && line.assetIssuer === assetIssuer);
}

/** Whether an account has a trustline (and therefore a balance line) for the given asset. */
export async function hasTrustline(
  network: StellarNetwork,
  publicKey: string,
  assetCode: string,
  assetIssuer: string,
): Promise<boolean> {
  const balances = await getBalances(network, publicKey);
  return findAssetBalance(balances, assetCode, assetIssuer) !== undefined;
}

// ---- Assets -----------------------------------------------------------------

/** Returns a Wallet-SDK asset reference, ready for TransactionBuilder's transfer/addAssetSupport. */
export function getUsdcAsset(network: StellarNetwork): IssuedAssetId {
  const { usdcIssuer } = getNetworkConfig(network);
  if (!usdcIssuer) {
    throw new Error(
      `No USDC issuer configured for "${network}" — verify the issuer's official stellar.toml ` +
        `before setting NEXT_PUBLIC_USDC_ISSUER_${network.toUpperCase()}.`,
    );
  }
  return new IssuedAssetId(USDC_ASSET_CODE, usdcIssuer);
}

// ---- Testnet funding -----------------------------------------------------

/**
 * Funds a new account via Friendbot. Testnet only — throws if the account is
 * already funded (Friendbot does not "top off" existing accounts).
 */
export async function fundTestnetAccount(publicKey: string): Promise<void> {
  if (!isValidPublicKey(publicKey)) {
    throw new Error(`"${publicKey}" is not a valid Stellar public key.`);
  }
  await getWallet("testnet").stellar().fundTestnetAccount(publicKey);
}

// ---- Fees -----------------------------------------------------------------

export function getRecommendedFee(network: StellarNetwork): Promise<string> {
  return getWallet(network).stellar().getRecommendedFee();
}

// ---- Transactions -----------------------------------------------------------

export function decodeTransaction(network: StellarNetwork, xdr: string) {
  return getWallet(network).stellar().decodeTransaction(xdr);
}

/** Submits a signed transaction via Horizon, with the Wallet SDK's built-in 504 retry. */
export function submitTransaction(
  network: StellarNetwork,
  signedTransaction: Transaction | FeeBumpTransaction,
): Promise<boolean> {
  return getWallet(network).stellar().submitTransaction(signedTransaction);
}

/** Simulates a Soroban transaction (fees, footprint, auth) before it's signed. */
export function simulateTransaction(network: StellarNetwork, transaction: Transaction) {
  return getRpcServer(network).simulateTransaction(transaction);
}

/** Block explorer link for a submitted transaction. */
export function getExplorerTxUrl(network: StellarNetwork, hash: string): string {
  const segment = network === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${segment}/tx/${hash}`;
}

/**
 * Maps the SDK errors common to any sign-and-submit flow (send, trustline, etc.) to a
 * message safe to show the user. Callers with their own domain-specific errors (e.g. "not
 * enough XLM to create this account") should check those first and fall back to this.
 */
export function describeStellarSubmitError(error: unknown): string {
  if (error instanceof Exceptions.AccountDoesNotExistError) {
    return "Your account isn't active on this network yet.";
  }
  if (error instanceof Exceptions.TransactionSubmitFailedError) {
    return "The network rejected this transaction — check the details and your balance, then try again.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong submitting this transaction.";
}

export type PaymentDirection = "incoming" | "outgoing";

export interface PaymentEntry {
  /** Operation id — unique per row, stable across pages. */
  id: string;
  transactionHash: string;
  /** Horizon operation type string, e.g. "payment", "create_account". */
  type: string;
  direction: PaymentDirection;
  /** The other party's public key, when the operation has one. */
  counterparty?: string;
  /** Undefined for operation types with no meaningful amount (e.g. account_merge). */
  amount?: string;
  /** "XLM" for native, the asset code for issued assets, undefined if not applicable. */
  assetCode?: string;
  memo?: string;
  createdAt: string;
  successful: boolean;
  pagingToken: string;
}

export interface PaymentsPage {
  entries: PaymentEntry[];
  /** Paging token to fetch the next (older) page with, or null if this was the last page. */
  nextCursor: string | null;
}

function extractMemo(tx: { memo_type: string; memo?: unknown }): string | undefined {
  if (tx.memo_type === "none" || tx.memo === undefined || tx.memo === null) return undefined;
  return String(tx.memo);
}

/** Native assets report as "native" with no asset_code — normalize to the display code "XLM". */
function assetCodeOf(record: { asset_type: string; asset_code?: string }): string {
  return record.asset_type === "native" ? "XLM" : (record.asset_code ?? "XLM");
}

async function mapPaymentRecord(
  record: Horizon.ServerApi.OperationRecord,
  myPublicKey: string,
): Promise<PaymentEntry> {
  const base = {
    id: record.id,
    transactionHash: record.transaction_hash,
    type: record.type,
    createdAt: record.created_at,
    successful: record.transaction_successful,
    pagingToken: record.paging_token,
  };

  let memo: string | undefined;
  try {
    const transaction = await record.transaction();
    memo = extractMemo(transaction);
  } catch {
    // join=transactions should always embed this; if it's ever missing, just omit the memo.
    memo = undefined;
  }

  switch (record.type) {
    case "create_account": {
      const direction: PaymentDirection = record.account === myPublicKey ? "incoming" : "outgoing";
      return {
        ...base,
        direction,
        counterparty: direction === "incoming" ? record.funder : record.account,
        amount: record.starting_balance,
        assetCode: "XLM",
        memo,
      };
    }
    case "payment": {
      const direction: PaymentDirection = record.to === myPublicKey ? "incoming" : "outgoing";
      return {
        ...base,
        direction,
        counterparty: direction === "incoming" ? record.from : record.to,
        amount: record.amount,
        assetCode: assetCodeOf(record),
        memo,
      };
    }
    case "path_payment_strict_receive":
    case "path_payment_strict_send": {
      const direction: PaymentDirection = record.to === myPublicKey ? "incoming" : "outgoing";
      return {
        ...base,
        direction,
        counterparty: direction === "incoming" ? record.from : record.to,
        amount: record.amount,
        assetCode: assetCodeOf(record),
        memo,
      };
    }
    case "account_merge": {
      const direction: PaymentDirection = record.into === myPublicKey ? "incoming" : "outgoing";
      return {
        ...base,
        direction,
        counterparty: direction === "incoming" ? record.source_account : record.into,
        memo,
      };
    }
    default: {
      const direction: PaymentDirection =
        record.source_account === myPublicKey ? "outgoing" : "incoming";
      return { ...base, direction, memo };
    }
  }
}

/**
 * Payment history for an account — incoming and outgoing payments, account creations, and
 * path payments, newest first. Uses Horizon's dedicated /payments endpoint (not
 * /transactions) since it's operation-level, giving direction/amount/asset directly instead
 * of requiring a second lookup per transaction. `join("transactions")` embeds each operation's
 * parent transaction so the memo is available with no extra round-trip (verified: resolves
 * from the already-fetched payload, not a new request).
 */
export async function listPayments(
  network: StellarNetwork,
  publicKey: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<PaymentsPage> {
  const { limit = 10, cursor } = options;

  let builder = getHorizonServer(network)
    .payments()
    .forAccount(publicKey)
    .join("transactions")
    .order("desc")
    .limit(limit)
    .includeFailed(true);
  if (cursor) {
    builder = builder.cursor(cursor);
  }

  let page;
  try {
    page = await builder.call();
  } catch (error) {
    if (isNotFoundError(error)) throw new AccountNotFoundError(network);
    throw error;
  }

  const entries = await Promise.all(
    page.records.map((record) => mapPaymentRecord(record, publicKey)),
  );

  const lastRecord = page.records[page.records.length - 1];
  const nextCursor = entries.length === limit && lastRecord ? lastRecord.paging_token : null;

  return { entries, nextCursor };
}
