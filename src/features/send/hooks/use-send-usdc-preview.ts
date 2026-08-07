"use client";

import { useMutation } from "@tanstack/react-query";

import { previewSendUsdc } from "@/features/send/services/send-usdc-service";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";
import type { StellarNetwork } from "@/lib/network";

export function useSendUsdcPreview(network: StellarNetwork) {
  return useMutation({
    mutationFn: (values: SendPaymentFormValues) => previewSendUsdc(network, values),
  });
}
