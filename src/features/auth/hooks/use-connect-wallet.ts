"use client";

import { useMutation } from "@tanstack/react-query";

import { unlockWallet } from "@/features/auth/services/wallet-service";
import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

/** Unlocks the wallet already stored on this device by decrypting it with a password. */
export function useConnectWallet() {
  const setUnlocked = useWalletSessionStore((state) => state.setUnlocked);

  return useMutation({
    mutationFn: (password: string) => unlockWallet(password),
    onSuccess: ({ keypair }) => {
      setUnlocked(keypair);
    },
  });
}
