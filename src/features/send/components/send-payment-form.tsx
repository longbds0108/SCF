"use client";

import { type FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validateSendPaymentForm,
  type SendPaymentFieldErrors,
  type SendPaymentFormValues,
} from "@/features/send/types/send-payment";

interface SendPaymentFormProps {
  assetCode: string;
  availableBalance?: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onReview: (values: SendPaymentFormValues) => void;
}

export function SendPaymentForm({
  assetCode,
  availableBalance,
  isSubmitting,
  submitError,
  onReview,
}: SendPaymentFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SendPaymentFieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateSendPaymentForm({ destination, amount, memo });
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }

    if (availableBalance !== undefined && Number(result.data.amount) > Number(availableBalance)) {
      setFieldErrors({ amount: "Amount exceeds your available balance." });
      return;
    }

    setFieldErrors({});
    onReview(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="send-destination">Destination</Label>
        <Input
          id="send-destination"
          placeholder="G... or M..."
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          autoComplete="off"
          required
        />
        {fieldErrors.destination && (
          <p className="text-sm text-destructive">{fieldErrors.destination}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="send-amount">Amount</Label>
        <div className="relative">
          <Input
            id="send-amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="pr-16"
            required
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {assetCode}
          </span>
        </div>
        {availableBalance !== undefined && (
          <p className="text-xs text-muted-foreground">
            {availableBalance} {assetCode} available
          </p>
        )}
        {fieldErrors.amount && <p className="text-sm text-destructive">{fieldErrors.amount}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="send-memo">Memo (optional)</Label>
        <Input
          id="send-memo"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          maxLength={56}
        />
        {fieldErrors.memo && <p className="text-sm text-destructive">{fieldErrors.memo}</p>}
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Checking…" : "Review payment"}
      </Button>
    </form>
  );
}
