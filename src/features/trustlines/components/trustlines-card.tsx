"use client";

import { toast } from "sonner";

import { useWalletSession, useWalletSigner } from "@/features/auth";
import { AddTrustlineDialog } from "@/features/trustlines/components/add-trustline-dialog";
import { TrustlineList } from "@/features/trustlines/components/trustline-list";
import { useRemoveTrustline } from "@/features/trustlines/hooks/use-remove-trustline";
import { useTrustlines } from "@/features/trustlines/hooks/use-trustlines";
import { describeTrustlineError } from "@/features/trustlines/services/trustline-service";
import type { Trustline } from "@/features/trustlines/types/trustline";
import { QueryStateCard } from "@/components/query-state-card";
import { useNetworkStore } from "@/stores/network-store";

export function TrustlinesCard() {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const signer = useWalletSigner();
  const { data, isLoading, isError, error, refetch } = useTrustlines(network, publicKey);
  const removeMutation = useRemoveTrustline(network);

  function handleRemove(trustline: Trustline) {
    if (!signer) return;

    removeMutation.mutate(
      {
        keypair: signer,
        assetCode: trustline.assetCode,
        assetIssuer: trustline.assetIssuer,
        currentBalance: trustline.balance,
      },
      {
        onSuccess: () => toast.success(`${trustline.assetCode} trustline removed`),
        onError: (mutationError) => toast.error(describeTrustlineError(mutationError)),
      },
    );
  }

  const removingKey =
    removeMutation.isPending && removeMutation.variables
      ? `${removeMutation.variables.assetCode}:${removeMutation.variables.assetIssuer}`
      : null;

  return (
    <QueryStateCard
      title="Trustlines"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      className="sm:col-span-2 lg:col-span-3"
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <AddTrustlineDialog network={network} trustlines={data ?? []} />
        </div>
        <TrustlineList trustlines={data ?? []} onRemove={handleRemove} removingKey={removingKey} />
      </div>
    </QueryStateCard>
  );
}
