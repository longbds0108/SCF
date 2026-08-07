import { USDC_ASSET_CODE } from "@/lib/config";
import { getNetworkConfig, type StellarNetwork } from "@/lib/network";
import {
  findAssetBalance,
  loadAccount,
  mapAccountBalances,
  getNativeBalance,
  type AssetBalance,
} from "@/lib/stellar";

export type UsdcBalanceStatus =
  | { status: "available"; balance: string }
  | { status: "no-trustline" }
  | { status: "not-configured" };

export interface AccountOverview {
  sequence: string;
  nativeBalance: string;
  usdc: UsdcBalanceStatus;
  /** Every balance line, including native — the trustlines feature derives its list from this. */
  balances: AssetBalance[];
}

export async function fetchAccountOverview(
  network: StellarNetwork,
  publicKey: string,
): Promise<AccountOverview> {
  const account = await loadAccount(network, publicKey);
  const balances = mapAccountBalances(account);
  const { usdcIssuer } = getNetworkConfig(network);

  let usdc: UsdcBalanceStatus;
  if (!usdcIssuer) {
    usdc = { status: "not-configured" };
  } else {
    const usdcBalance = findAssetBalance(balances, USDC_ASSET_CODE, usdcIssuer);
    usdc = usdcBalance
      ? { status: "available", balance: usdcBalance.balance }
      : { status: "no-trustline" };
  }

  return {
    sequence: account.sequenceNumber(),
    nativeBalance: getNativeBalance(balances),
    usdc,
    balances,
  };
}
