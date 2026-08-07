"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addTrustline } from "@/features/trustlines/services/trustline-service";
import type { StellarNetwork } from "@/lib/network";

interface AddTrustlineParams {
  keypair: Keypair;
  assetCode: string;
  assetIssuer: string;
}

export function useAddTrustline(network: StellarNetwork) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keypair, assetCode, assetIssuer }: AddTrustlineParams) =>
      addTrustline(network, keypair, assetCode, assetIssuer),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account-overview", network] });
    },
  });
}
