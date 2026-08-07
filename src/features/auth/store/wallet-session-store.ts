import type { Keypair } from "@stellar/stellar-sdk";
import { create } from "zustand";

export type WalletSessionStatus = "checking" | "no-wallet" | "locked" | "unlocked";

interface WalletSessionState {
  status: WalletSessionStatus;
  publicKey: string | null;
  /** Decrypted signer for the active session. In-memory only — never persisted. */
  keypair: Keypair | null;
  setChecked: (publicKey: string | null) => void;
  setUnlocked: (keypair: Keypair) => void;
  lock: () => void;
  reset: () => void;
}

export const useWalletSessionStore = create<WalletSessionState>((set) => ({
  status: "checking",
  publicKey: null,
  keypair: null,
  setChecked: (publicKey) =>
    set({ status: publicKey ? "locked" : "no-wallet", publicKey, keypair: null }),
  setUnlocked: (keypair) => set({ status: "unlocked", publicKey: keypair.publicKey(), keypair }),
  lock: () => set((state) => ({ status: state.publicKey ? "locked" : "no-wallet", keypair: null })),
  reset: () => set({ status: "no-wallet", publicKey: null, keypair: null }),
}));
