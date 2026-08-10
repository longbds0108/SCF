"use client";

import { useMutation } from "@tanstack/react-query";

import { importWalletFromRecoveryPhrase } from "@/features/auth/services/wallet-service";
import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

export function useImportWalletFromPhrase() {
  const setUnlocked = useWalletSessionStore((state) => state.setUnlocked);

  return useMutation({
    mutationFn: ({ recoveryPhrase, password }: { recoveryPhrase: string; password: string }) =>
      importWalletFromRecoveryPhrase(recoveryPhrase, password),
    onSuccess: ({ keypair }) => {
      setUnlocked(keypair);
    },
  });
}
