"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeTrustline } from "@/features/trustlines/services/trustline-service";
import type { StellarNetwork } from "@/lib/network";

interface RemoveTrustlineParams {
  keypair: Keypair;
  assetCode: string;
  assetIssuer: string;
  currentBalance: string;
}

export function useRemoveTrustline(network: StellarNetwork) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keypair, assetCode, assetIssuer, currentBalance }: RemoveTrustlineParams) =>
      removeTrustline(network, keypair, assetCode, assetIssuer, currentBalance),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account-overview", network] });
    },
  });
}
