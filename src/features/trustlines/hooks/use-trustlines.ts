"use client";

import { useAccountOverview } from "@/features/wallet";
import { toTrustlines } from "@/features/trustlines/services/trustline-service";
import type { StellarNetwork } from "@/lib/network";

/**
 * Derived from the same account-overview query the dashboard's balance cards use — no
 * extra Horizon call, this just reshapes the balances already being fetched and cached.
 */
export function useTrustlines(network: StellarNetwork, publicKey: string | null) {
  const query = useAccountOverview(network, publicKey);
  return {
    ...query,
    data: query.data ? toTrustlines(query.data.balances) : undefined,
  };
}
