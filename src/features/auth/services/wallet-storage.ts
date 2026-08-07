import type { EncryptedPayload } from "./wallet-crypto";

const STORAGE_KEY = "stellar-wallet:wallet:v1";

export interface StoredWallet {
  publicKey: string;
  encryptedSecret: EncryptedPayload;
  createdAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readStoredWallet(): StoredWallet | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredWallet;
  } catch {
    return null;
  }
}

export function writeStoredWallet(wallet: StoredWallet): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
}

export function clearStoredWallet(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
