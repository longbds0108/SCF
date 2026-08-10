"use client";

import { useWalletSession } from "@/features/auth";
import { useAccountOverview } from "@/features/wallet/hooks/use-account-overview";
import { QueryStateCard } from "@/components/query-state-card";
import { UsdcIcon } from "@/components/usdc-icon";
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
        <p className="flex items-center gap-2 text-lg font-semibold">
          <UsdcIcon className="h-5 w-5 shrink-0" />
          {data.usdc.balance}{" "}
          <span className="text-sm font-normal text-muted-foreground">USDC</span>
        </p>
      )}
      {data?.usdc.status === "no-trustline" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsdcIcon className="h-5 w-5 shrink-0 opacity-50" />
          No USDC trustline
        </p>
      )}
      {data?.usdc.status === "not-configured" && (
        <p className="text-sm text-muted-foreground">USDC issuer not configured for {network}</p>
      )}
    </QueryStateCard>
  );
}
