"use client";

import { useState } from "react";

import { PublicKeyDisplay } from "@/features/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trustline } from "@/features/trustlines/types/trustline";

interface TrustlineRowProps {
  trustline: Trustline;
  onRemove: () => void;
  isRemoving: boolean;
}

export function TrustlineRow({ trustline, onRemove, isRemoving }: TrustlineRowProps) {
  const [confirming, setConfirming] = useState(false);
  const hasBalance = Number(trustline.balance) > 0;

  return (
    <div className="space-y-2 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{trustline.assetCode}</Badge>
          <span className="text-sm font-medium">{trustline.balance}</span>
        </div>

        {confirming ? (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={onRemove} disabled={isRemoving}>
              {isRemoving ? "Removing…" : "Confirm"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirming(true)}
            disabled={hasBalance}
          >
            Remove
          </Button>
        )}
      </div>

      <PublicKeyDisplay publicKey={trustline.assetIssuer} truncate />

      {hasBalance && (
        <p className="text-xs text-muted-foreground">
          Balance must be 0 before this trustline can be removed.
        </p>
      )}
    </div>
  );
}
