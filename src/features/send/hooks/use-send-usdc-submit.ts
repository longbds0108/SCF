"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendUsdc } from "@/features/send/services/send-usdc-service";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";
import type { StellarNetwork } from "@/lib/network";

interface SendUsdcSubmitParams {
  keypair: Keypair;
  values: SendPaymentFormValues;
}

export function useSendUsdcSubmit(network: StellarNetwork) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keypair, values }: SendUsdcSubmitParams) => sendUsdc(network, keypair, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account-overview", network] });
      void queryClient.invalidateQueries({ queryKey: ["recent-transactions", network] });
    },
  });
}
