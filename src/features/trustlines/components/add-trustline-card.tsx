"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AddTrustlineCardProps {
  assetCode: string;
  isSubmitting: boolean;
  error?: string | null;
  onAdd: () => void;
}

export function AddTrustlineCard({ assetCode, isSubmitting, error, onAdd }: AddTrustlineCardProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You need a {assetCode} trustline before you can hold or send it. This is a one-time,
        on-chain opt-in — it costs a small network fee and a minimum XLM reserve.
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="button" className="w-full" onClick={onAdd} disabled={isSubmitting}>
        {isSubmitting ? "Adding trustline…" : `Add ${assetCode} trustline`}
      </Button>
    </div>
  );
}
