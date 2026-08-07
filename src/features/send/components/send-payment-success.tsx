"use client";

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExplorerTxUrl } from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";

interface SendPaymentSuccessProps {
  hash: string;
  network: StellarNetwork;
  onSendAnother: () => void;
  onClose?: () => void;
}

export function SendPaymentSuccess({
  hash,
  network,
  onSendAnother,
  onClose,
}: SendPaymentSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <CheckCircle2 className="h-12 w-12 text-primary" />
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <p className="font-semibold">Payment sent</p>
          <Badge>Success</Badge>
        </div>
        <a
          href={getExplorerTxUrl(network, hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-xs truncate font-mono text-xs text-muted-foreground underline"
        >
          {hash}
        </a>
      </div>
      <div className="flex w-full gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onSendAnother}>
          Send another
        </Button>
        {onClose && (
          <Button type="button" className="flex-1" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
