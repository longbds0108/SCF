"use client";

import { useMutation } from "@tanstack/react-query";

import { createWallet } from "@/features/auth/services/wallet-service";

/**
 * Creates and encrypts a new wallet. Deliberately does NOT connect the session
 * on success — the caller must show the secret key once for backup and only
 * then call useCompleteWalletSetup(), otherwise the UI could navigate away
 * before the user has saved their only copy of the secret key.
 */
export function useCreateWallet() {
  return useMutation({
    mutationFn: (password: string) => createWallet(password),
  });
}
