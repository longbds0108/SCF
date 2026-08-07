"use client";

import { useWalletSession } from "@/features/auth";
import { useAccountOverview } from "@/features/wallet/hooks/use-account-overview";
import { QueryStateCard } from "@/components/query-state-card";
import { useNetworkStore } from "@/stores/network-store";

export function NativeBalanceCard() {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const { data, isLoading, isError, error, refetch } = useAccountOverview(network, publicKey);

  return (
    <QueryStateCard
      title="XLM Balance"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <p className="text-lg font-semibold">
        {data?.nativeBalance} <span className="text-sm font-normal text-muted-foreground">XLM</span>
      </p>
    </QueryStateCard>
  );
}
