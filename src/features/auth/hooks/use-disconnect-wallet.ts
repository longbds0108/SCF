"use client";

import { useCallback } from "react";

import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

/** Clears the decrypted signer from memory. The encrypted wallet stays on disk. */
export function useDisconnectWallet() {
  const lock = useWalletSessionStore((state) => state.lock);
  return useCallback(() => lock(), [lock]);
}
