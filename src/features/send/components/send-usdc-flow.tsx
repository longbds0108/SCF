"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useWalletSession, useWalletSigner } from "@/features/auth";
import {
  AddTrustlineCard,
  useAddUsdcTrustline,
  describeTrustlineError,
} from "@/features/trustlines";
import { useAccountOverview } from "@/features/wallet";
import { SendPaymentForm } from "@/features/send/components/send-payment-form";
import { SendPaymentPreviewCard } from "@/features/send/components/send-payment-preview";
import { SendPaymentSuccess } from "@/features/send/components/send-payment-success";
import { useSendUsdcPreview } from "@/features/send/hooks/use-send-usdc-preview";
import { useSendUsdcSubmit } from "@/features/send/hooks/use-send-usdc-submit";
import { describeSendUsdcError } from "@/features/send/services/send-usdc-service";
import type { SendPaymentFormValues } from "@/features/send/types/send-payment";
import { useNetworkStore } from "@/stores/network-store";

interface SendUsdcFlowProps {
  onClose?: () => void;
}

/** Same three-step pattern as SendXlmFlow, with a trustline gate in front of it. */
export function SendUsdcFlow({ onClose }: SendUsdcFlowProps) {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const signer = useWalletSigner();
  const { data: overview, isLoading: isOverviewLoading } = useAccountOverview(network, publicKey);

  const addTrustlineMutation = useAddUsdcTrustline(network);
  const previewMutation = useSendUsdcPreview(network);
  const submitMutation = useSendUsdcSubmit(network);
  const [pendingValues, setPendingValues] = useState<SendPaymentFormValues | null>(null);

  function handleAddTrustline() {
    if (!signer) return;
    addTrustlineMutation.mutate(signer, {
      onSuccess: () => {
        toast.success("USDC trustline added");
      },
    });
  }

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
            description: `${pendingValues.amount} USDC sent successfully.`,
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
        assetCode="USDC"
        memo={preview.memo}
        isSubmitting={submitMutation.isPending}
        error={submitMutation.isError ? describeSendUsdcError(submitMutation.error) : null}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    );
  }

  if (isOverviewLoading) {
    return <p className="text-sm text-muted-foreground">Checking your USDC trustline…</p>;
  }

  if (overview?.usdc.status !== "available") {
    return (
      <AddTrustlineCard
        assetCode="USDC"
        isSubmitting={addTrustlineMutation.isPending}
        error={
          addTrustlineMutation.isError ? describeTrustlineError(addTrustlineMutation.error) : null
        }
        onAdd={handleAddTrustline}
      />
    );
  }

  return (
    <SendPaymentForm
      assetCode="USDC"
      availableBalance={overview.usdc.status === "available" ? overview.usdc.balance : undefined}
      isSubmitting={previewMutation.isPending}
      submitError={previewMutation.isError ? describeSendUsdcError(previewMutation.error) : null}
      onReview={handleReview}
    />
  );
}
