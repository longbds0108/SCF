"use client";

import { useEffect } from "react";

import { getStoredPublicKey } from "@/features/auth/services/wallet-service";
import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

/**
 * Reads the current wallet session and — on first mount anywhere in the app —
 * checks localStorage once to resolve "checking" into "no-wallet" or "locked".
 * Safe to call from multiple components; the check only runs once because it's
 * guarded by the shared store's status, not per-component state.
 */
export function useWalletSession() {
  const status = useWalletSessionStore((state) => state.status);
  const publicKey = useWalletSessionStore((state) => state.publicKey);
  const setChecked = useWalletSessionStore((state) => state.setChecked);

  useEffect(() => {
    if (status !== "checking") return;
    setChecked(getStoredPublicKey());
  }, [status, setChecked]);

  return {
    status,
    publicKey,
    isConnected: status === "unlocked",
    hasStoredWallet: status === "locked" || status === "unlocked",
  };
}
