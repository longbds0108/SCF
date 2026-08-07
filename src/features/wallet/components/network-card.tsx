"use client";

import { Badge } from "@/components/ui/badge";
import { QueryStateCard } from "@/components/query-state-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StellarNetwork } from "@/lib/network";
import { useNetworkStore } from "@/stores/network-store";

export function NetworkCard() {
  const network = useNetworkStore((state) => state.network);
  const setNetwork = useNetworkStore((state) => state.setNetwork);

  return (
    <QueryStateCard title="Network">
      <div className="space-y-2">
        <Select value={network} onValueChange={(value) => setNetwork(value as StellarNetwork)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="testnet">Testnet</SelectItem>
            <SelectItem value="mainnet">Mainnet</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant={network === "mainnet" ? "default" : "secondary"} className="capitalize">
          {network}
        </Badge>
        {network === "mainnet" && (
          <p className="text-xs text-muted-foreground">
            Mainnet uses real funds — everything here is live.
          </p>
        )}
      </div>
    </QueryStateCard>
  );
}
