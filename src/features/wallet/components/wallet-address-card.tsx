"use client";

import { PublicKeyDisplay, useWalletSession } from "@/features/auth";
import { QueryStateCard } from "@/components/query-state-card";

export function WalletAddressCard() {
  const { publicKey } = useWalletSession();

  return (
    <QueryStateCard title="Wallet Address">
      {publicKey ? (
        <PublicKeyDisplay publicKey={publicKey} truncate />
      ) : (
        <p className="text-sm text-muted-foreground">Not connected</p>
      )}
    </QueryStateCard>
  );
}
