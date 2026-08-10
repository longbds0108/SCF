"use client";

import { useMutation } from "@tanstack/react-query";

import { createWalletFromRecoveryPhrase } from "@/features/auth/services/wallet-service";

/**
 * Mirrors useCreateWallet but backs the new wallet with a SEP-0005 recovery phrase instead of
 * a raw secret key. Deliberately doesn't connect the session on success — same reasoning as
 * useCreateWallet: the phrase must be shown and confirmed before navigating away.
 */
export function useCreateWalletFromPhrase() {
  return useMutation({
    mutationFn: (password: string) => createWalletFromRecoveryPhrase(password),
  });
}
