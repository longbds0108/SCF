"use client";

import { useState } from "react";

import { useWalletSession } from "@/features/auth/hooks/use-wallet-session";
import { ConnectedWalletCard } from "@/features/auth/components/connected-wallet-card";
import { ConnectWalletForm } from "@/features/auth/components/connect-wallet-form";
import { CreateWalletForm } from "@/features/auth/components/create-wallet-form";
import { ImportWalletForm } from "@/features/auth/components/import-wallet-form";
import { Button } from "@/components/ui/button";

type SetupMode = "create" | "import";

/** Top-level entry point for wallet management — decides which view to show. */
export function WalletPanel() {
  const { status } = useWalletSession();
  const [mode, setMode] = useState<SetupMode>("create");

  if (status === "checking") {
    return <p className="text-sm text-muted-foreground">Checking for a wallet on this device…</p>;
  }

  if (status === "unlocked") {
    return <ConnectedWalletCard />;
  }

  if (status === "locked") {
    return <ConnectWalletForm />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "create" ? "default" : "outline"}
          onClick={() => setMode("create")}
        >
          Create wallet
        </Button>
        <Button
          type="button"
          variant={mode === "import" ? "default" : "outline"}
          onClick={() => setMode("import")}
        >
          Import wallet
        </Button>
      </div>
      {mode === "create" ? <CreateWalletForm /> : <ImportWalletForm />}
    </div>
  );
}
