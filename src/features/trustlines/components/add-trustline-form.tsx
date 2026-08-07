"use client";

import { type FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validateAddTrustlineForm,
  type AddTrustlineFieldErrors,
} from "@/features/trustlines/types/trustline";

interface AddTrustlineFormProps {
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (assetCode: string, assetIssuer: string) => void;
}

export function AddTrustlineForm({ isSubmitting, submitError, onSubmit }: AddTrustlineFormProps) {
  const [assetCode, setAssetCode] = useState("");
  const [assetIssuer, setAssetIssuer] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AddTrustlineFieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateAddTrustlineForm({ assetCode, assetIssuer });
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }

    setFieldErrors({});
    onSubmit(result.data.assetCode, result.data.assetIssuer);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="trustline-asset-code">Asset code</Label>
        <Input
          id="trustline-asset-code"
          placeholder="USDC"
          value={assetCode}
          onChange={(event) => setAssetCode(event.target.value)}
          maxLength={12}
          required
        />
        {fieldErrors.assetCode && (
          <p className="text-sm text-destructive">{fieldErrors.assetCode}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="trustline-asset-issuer">Issuer</Label>
        <Input
          id="trustline-asset-issuer"
          placeholder="G..."
          value={assetIssuer}
          onChange={(event) => setAssetIssuer(event.target.value)}
          autoComplete="off"
          required
        />
        {fieldErrors.assetIssuer && (
          <p className="text-sm text-destructive">{fieldErrors.assetIssuer}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Adding a trustline reserves a small amount of XLM (currently 0.5 XLM) on your account until
        you remove it. Only trust issuers you&apos;ve verified.
      </p>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding…" : "Add trustline"}
      </Button>
    </form>
  );
}
