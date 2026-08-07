"use client";

import { useDisconnectWallet } from "@/features/auth/hooks/use-disconnect-wallet";
import { Button } from "@/components/ui/button";

export function DisconnectButton({ className }: { className?: string }) {
  const disconnect = useDisconnectWallet();

  return (
    <Button type="button" variant="outline" className={className} onClick={disconnect}>
      Disconnect
    </Button>
  );
}
