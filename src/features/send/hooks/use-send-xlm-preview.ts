"use client";

import { useMutation } from "@tanstack/react-query";

import { previewSendXlm } from "@/features/send/services/send-xlm-service";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";
import type { StellarNetwork } from "@/lib/network";

export function useSendXlmPreview(network: StellarNetwork) {
  return useMutation({
    mutationFn: (values: SendPaymentFormValues) => previewSendXlm(network, values),
  });
}
