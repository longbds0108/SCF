"use client";

import { useQuery } from "@tanstack/react-query";

import { AUTO_REFRESH_INTERVAL_MS } from "@/lib/config";
import type { StellarNetwork } from "@/lib/network";
import { fetchAccountOverview } from "@/features/wallet/services/account-overview";

/**
 * Backs the native balance, USDC balance, and sequence cards. All three call
 * this same hook — React Query dedupes identical query keys, so that's one
 * Horizon request shared across the cards, not three.
 */
export function useAccountOverview(network: StellarNetwork, publicKey: string | null) {
  return useQuery({
    queryKey: ["account-overview", network, publicKey],
    queryFn: () => fetchAccountOverview(network, publicKey as string),
    enabled: Boolean(publicKey),
    refetchInterval: AUTO_REFRESH_INTERVAL_MS,
  });
}
