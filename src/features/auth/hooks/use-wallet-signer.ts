"use client";

import { useWalletSessionStore } from "@/features/auth/store/wallet-session-store";

/** The connected session's signer, or null unless the wallet is unlocked. */
export function useWalletSigner() {
  return useWalletSessionStore((state) => state.keypair);
}
