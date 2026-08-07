"use client";

import { useWalletSession } from "@/features/auth";
import { useAccountOverview } from "@/features/wallet/hooks/use-account-overview";
import { QueryStateCard } from "@/components/query-state-card";
import { useNetworkStore } from "@/stores/network-store";

export function SequenceCard() {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const { data, isLoading, isError, error, refetch } = useAccountOverview(network, publicKey);

  return (
    <QueryStateCard
      title="Account Sequence"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <p className="font-mono text-sm">{data?.sequence}</p>
    </QueryStateCard>
  );
}
