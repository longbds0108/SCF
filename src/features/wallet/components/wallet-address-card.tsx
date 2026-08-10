"use client";

import { useState } from "react";

import {
  DisconnectButton,
  PublicKeyDisplay,
  useRemoveWallet,
  useWalletSession,
} from "@/features/auth";
import { QueryStateCard } from "@/components/query-state-card";
import { Button } from "@/components/ui/button";

export function WalletAddressCard() {
  const { publicKey } = useWalletSession();
  const removeWallet = useRemoveWallet();
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  return (
    <QueryStateCard title="Wallet Address">
      {publicKey ? (
        <div className="space-y-3">
          <PublicKeyDisplay publicKey={publicKey} truncate />
          <div className="flex flex-wrap items-center gap-2">
            <DisconnectButton />
            {confirmingRemove ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeWallet.mutate()}
                  disabled={removeWallet.isPending}
                >
                  Confirm remove
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingRemove(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setConfirmingRemove(true)}
              >
                Remove wallet from this device
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not connected</p>
      )}
    </QueryStateCard>
  );
}
