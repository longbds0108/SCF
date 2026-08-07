"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addUsdcTrustline } from "@/features/trustlines/services/trustline-service";
import type { StellarNetwork } from "@/lib/network";

export function useAddUsdcTrustline(network: StellarNetwork) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keypair: Keypair) => addUsdcTrustline(network, keypair),
    onSuccess: () => {
      // The dashboard's USDC balance card reads the same query — refresh it immediately.
      void queryClient.invalidateQueries({ queryKey: ["account-overview", network] });
    },
  });
}
