"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useWalletSession, useWalletSigner } from "@/features/auth";
import { useAccountOverview } from "@/features/wallet";
import { SendPaymentForm } from "@/features/send/components/send-payment-form";
import { SendPaymentPreviewCard } from "@/features/send/components/send-payment-preview";
import { SendPaymentSuccess } from "@/features/send/components/send-payment-success";
import { useSendXlmPreview } from "@/features/send/hooks/use-send-xlm-preview";
import { useSendXlmSubmit } from "@/features/send/hooks/use-send-xlm-submit";
import { describeSendXlmError } from "@/features/send/services/send-xlm-service";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";
import { useNetworkStore } from "@/stores/network-store";

interface SendXlmFlowProps {
  onClose?: () => void;
}

/** Orchestrates the three-step flow (form → preview → success), owns all hook state. */
export function SendXlmFlow({ onClose }: SendXlmFlowProps) {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const signer = useWalletSigner();
  const { data: overview } = useAccountOverview(network, publicKey);

  const previewMutation = useSendXlmPreview(network);
  const submitMutation = useSendXlmSubmit(network);
  const [pendingValues, setPendingValues] = useState<SendPaymentFormValues | null>(null);

  function handleReview(values: SendPaymentFormValues) {
    setPendingValues(values);
    previewMutation.mutate(values);
  }

  function handleConfirm() {
    if (!signer || !pendingValues) return;

    submitMutation.mutate(
      { keypair: signer, values: pendingValues },
      {
        onSuccess: () => {
          toast.success("Payment sent", {
            description: `${pendingValues.amount} XLM sent successfully.`,
          });
        },
      },
    );
  }

  function handleBack() {
    previewMutation.reset();
  }

  function handleSendAnother() {
    previewMutation.reset();
    submitMutation.reset();
    setPendingValues(null);
  }

  if (submitMutation.isSuccess) {
    return (
      <SendPaymentSuccess
        hash={submitMutation.data.hash}
        network={network}
        onSendAnother={handleSendAnother}
        onClose={onClose}
      />
    );
  }

  if (previewMutation.data) {
    const preview = previewMutation.data;
    return (
      <SendPaymentPreviewCard
        destination={preview.destination}
        amount={preview.amount}
        assetCode="XLM"
        memo={preview.memo}
        infoNotice={
          preview.willCreateAccount
            ? "This destination doesn't exist yet — this payment will create it on the network."
            : undefined
        }
        isSubmitting={submitMutation.isPending}
        error={submitMutation.isError ? describeSendXlmError(submitMutation.error) : null}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <SendPaymentForm
      assetCode="XLM"
      availableBalance={overview?.nativeBalance}
      isSubmitting={previewMutation.isPending}
      submitError={previewMutation.isError ? describeSendXlmError(previewMutation.error) : null}
      onReview={handleReview}
    />
  );
}
