"use client";

import { useMutation } from "@tanstack/react-query";

import { importWallet } from "@/features/auth/services/wallet-service";
import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

export function useImportWallet() {
  const setUnlocked = useWalletSessionStore((state) => state.setUnlocked);

  return useMutation({
    mutationFn: ({ secretKey, password }: { secretKey: string; password: string }) =>
      importWallet(secretKey, password),
    onSuccess: ({ keypair }) => {
      setUnlocked(keypair);
    },
  });
}
