"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SendPaymentPreviewCardProps {
  destination: string;
  amount: string;
  assetCode: string;
  memo?: string;
  /** Optional informational banner — e.g. "this will create the destination account". */
  infoNotice?: string;
  isSubmitting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function SendPaymentPreviewCard({
  destination,
  amount,
  assetCode,
  memo,
  infoNotice,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: SendPaymentPreviewCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Status</span>
        <Badge variant={error ? "destructive" : isSubmitting ? "secondary" : "outline"}>
          {error ? "Failed" : isSubmitting ? "Pending" : "Ready to send"}
        </Badge>
      </div>

      <dl className="divide-y divide-border text-sm">
        <div className="flex justify-between gap-4 py-2">
          <dt className="shrink-0 text-muted-foreground">Destination</dt>
          <dd className="break-all text-right font-mono">{destination}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="shrink-0 text-muted-foreground">Amount</dt>
          <dd className="font-semibold">
            {amount} {assetCode}
          </dd>
        </div>
        {memo && (
          <div className="flex justify-between gap-4 py-2">
            <dt className="shrink-0 text-muted-foreground">Memo</dt>
            <dd className="break-all text-right">{memo}</dd>
          </div>
        )}
      </dl>

      {infoNotice && (
        <Alert>
          <AlertDescription>{infoNotice}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Confirm & Send"}
        </Button>
      </div>
    </div>
  );
}
