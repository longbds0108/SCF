"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendXlm } from "@/features/send/services/send-xlm-service";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";
import type { StellarNetwork } from "@/lib/network";

interface SendXlmSubmitParams {
  keypair: Keypair;
  values: SendPaymentFormValues;
}

export function useSendXlmSubmit(network: StellarNetwork) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keypair, values }: SendXlmSubmitParams) => sendXlm(network, keypair, values),
    onSuccess: () => {
      // Refresh the dashboard immediately instead of waiting for its next poll.
      void queryClient.invalidateQueries({ queryKey: ["account-overview", network] });
      void queryClient.invalidateQueries({ queryKey: ["recent-transactions", network] });
    },
  });
}
