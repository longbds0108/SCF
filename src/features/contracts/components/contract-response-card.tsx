"use client";

import { Badge } from "@/components/ui/badge";
import { JsonValue } from "@/components/json-value";
import { getExplorerTxUrl } from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";

interface ContractResponseCardProps {
  title: string;
  status: "success" | "error";
  value?: unknown;
  errorMessage?: string;
  /** Present for invocations that were actually submitted (not simulations or reads). */
  hash?: string;
  network?: StellarNetwork;
}

/** Generic response display, reused for simulation results, invoke results, and storage reads. */
export function ContractResponseCard({
  title,
  status,
  value,
  errorMessage,
  hash,
  network,
}: ContractResponseCardProps) {
  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant={status === "success" ? "outline" : "destructive"}>
          {status === "success" ? "Success" : "Error"}
        </Badge>
      </div>

      {status === "success" ? (
        <JsonValue value={value} />
      ) : (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {hash && network && (
        <a
          href={getExplorerTxUrl(network, hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-muted-foreground underline"
        >
          View transaction
        </a>
      )}
    </div>
  );
}
