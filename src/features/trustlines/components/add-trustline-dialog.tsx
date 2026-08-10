"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useWalletSigner } from "@/features/auth";
import { AddTrustlineForm } from "@/features/trustlines/components/add-trustline-form";
import { useAddTrustline } from "@/features/trustlines/hooks/use-add-trustline";
import { describeTrustlineError } from "@/features/trustlines/services/trustline-service";
import type { Trustline } from "@/features/trustlines/types/trustline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UsdcIcon } from "@/components/usdc-icon";
import { getUsdcAsset } from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";

interface AddTrustlineDialogProps {
  network: StellarNetwork;
  trustlines: Trustline[];
}

export function AddTrustlineDialog({ network, trustlines }: AddTrustlineDialogProps) {
  const [open, setOpen] = useState(false);
  const signer = useWalletSigner();
  const addTrustlineMutation = useAddTrustline(network);

  let usdcAsset: { code: string; issuer: string } | null = null;
  try {
    usdcAsset = getUsdcAsset(network);
  } catch {
    usdcAsset = null;
  }
  const alreadyTrustsUsdc =
    usdcAsset !== null &&
    trustlines.some((t) => t.assetCode === usdcAsset.code && t.assetIssuer === usdcAsset.issuer);

  function handleAdd(assetCode: string, assetIssuer: string) {
    if (!signer) return;

    const alreadyTrusted = trustlines.some(
      (t) => t.assetCode === assetCode && t.assetIssuer === assetIssuer,
    );
    if (alreadyTrusted) {
      toast.error(`You already trust ${assetCode} from this issuer.`);
      return;
    }

    addTrustlineMutation.mutate(
      { keypair: signer, assetCode, assetIssuer },
      {
        onSuccess: () => {
          toast.success(`${assetCode} trustline added`);
          setOpen(false);
          addTrustlineMutation.reset();
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) addTrustlineMutation.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Add trustline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a trustline</DialogTitle>
        </DialogHeader>

        {!alreadyTrustsUsdc && usdcAsset && (
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={() => handleAdd(usdcAsset.code, usdcAsset.issuer)}
            disabled={addTrustlineMutation.isPending}
          >
            <UsdcIcon className="h-4 w-4 shrink-0" />
            Quick add: USDC
          </Button>
        )}

        <AddTrustlineForm
          isSubmitting={addTrustlineMutation.isPending}
          submitError={
            addTrustlineMutation.isError ? describeTrustlineError(addTrustlineMutation.error) : null
          }
          onSubmit={handleAdd}
        />
      </DialogContent>
    </Dialog>
  );
}
