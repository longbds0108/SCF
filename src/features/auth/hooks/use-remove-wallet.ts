"use client";

import { useMutation } from "@tanstack/react-query";

import { removeStoredWallet } from "@/features/auth/services/wallet-service";
import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

/** Deletes the encrypted wallet from this device entirely. Irreversible without a backup. */
export function useRemoveWallet() {
  const reset = useWalletSessionStore((state) => state.reset);

  return useMutation({
    mutationFn: async () => {
      removeStoredWallet();
    },
    onSuccess: () => {
      reset();
    },
  });
}
