"use client";

import { TrustlineRow } from "@/features/trustlines/components/trustline-row";
import type { Trustline } from "@/features/trustlines/types/trustline";

interface TrustlineListProps {
  trustlines: Trustline[];
  onRemove: (trustline: Trustline) => void;
  /** "assetCode:assetIssuer" of the trustline currently being removed, if any. */
  removingKey: string | null;
}

export function TrustlineList({ trustlines, onRemove, removingKey }: TrustlineListProps) {
  if (trustlines.length === 0) {
    return <p className="text-sm text-muted-foreground">No trustlines yet.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {trustlines.map((trustline) => {
        const key = `${trustline.assetCode}:${trustline.assetIssuer}`;
        return (
          <TrustlineRow
            key={key}
            trustline={trustline}
            onRemove={() => onRemove(trustline)}
            isRemoving={removingKey === key}
          />
        );
      })}
    </div>
  );
}
