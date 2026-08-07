"use client";

import { useState } from "react";

import { useRemoveWallet } from "@/features/auth/hooks/use-remove-wallet";
import { useWalletSession } from "@/features/auth/hooks/use-wallet-session";
import { DisconnectButton } from "@/features/auth/components/disconnect-button";
import { PublicKeyDisplay } from "@/features/auth/components/public-key-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ConnectedWalletCard() {
  const { publicKey } = useWalletSession();
  const removeWallet = useRemoveWallet();
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  if (!publicKey) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet connected</CardTitle>
        <CardDescription>Testnet</CardDescription>
      </CardHeader>
      <CardContent>
        <PublicKeyDisplay publicKey={publicKey} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <DisconnectButton className="w-full" />
        {confirmingRemove ? (
          <div className="flex w-full gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => removeWallet.mutate()}
              disabled={removeWallet.isPending}
            >
              Confirm remove
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmingRemove(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setConfirmingRemove(true)}
          >
            Remove wallet from this device
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
