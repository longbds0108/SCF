"use client";

import { useWalletSession } from "@/features/auth";
import { useAccountOverview } from "@/features/wallet/hooks/use-account-overview";
import { QueryStateCard } from "@/components/query-state-card";
import { useNetworkStore } from "@/stores/network-store";

export function UsdcBalanceCard() {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const { data, isLoading, isError, error, refetch } = useAccountOverview(network, publicKey);

  return (
    <QueryStateCard
      title="USDC Balance"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      {data?.usdc.status === "available" && (
        <p className="text-lg font-semibold">
          {data.usdc.balance}{" "}
          <span className="text-sm font-normal text-muted-foreground">USDC</span>
        </p>
      )}
      {data?.usdc.status === "no-trustline" && (
        <p className="text-sm text-muted-foreground">No USDC trustline</p>
      )}
      {data?.usdc.status === "not-configured" && (
        <p className="text-sm text-muted-foreground">USDC issuer not configured for {network}</p>
      )}
    </QueryStateCard>
  );
}
