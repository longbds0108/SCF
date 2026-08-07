"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useCallback } from "react";

import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

/** Connects the session once the user has confirmed they saved their secret key. */
export function useCompleteWalletSetup() {
  const setUnlocked = useWalletSessionStore((state) => state.setUnlocked);
  return useCallback((keypair: Keypair) => setUnlocked(keypair), [setUnlocked]);
}
