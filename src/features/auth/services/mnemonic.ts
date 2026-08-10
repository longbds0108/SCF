import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { Keypair } from "@stellar/stellar-sdk";
import { derivePath } from "ed25519-hd-key";

/** SEP-0005: Stellar's registered BIP-44 coin type is 148; account 0 is the default. */
const STELLAR_DERIVATION_PATH = "m/44'/148'/0'";

function normalize(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, " ");
}

/** A new 24-word (256-bit entropy) SEP-0005 recovery phrase. */
export function generateRecoveryPhrase(): string {
  return generateMnemonic(wordlist, 256);
}

export function isValidRecoveryPhrase(phrase: string): boolean {
  return validateMnemonic(normalize(phrase), wordlist);
}

/**
 * Derives the account-0 Stellar keypair from a SEP-0005 recovery phrase — the same
 * derivation path (m/44'/148'/0') used by Lobstr, Freighter, and other Stellar wallets, so a
 * phrase generated elsewhere unlocks the same account here, and vice versa.
 */
export function keypairFromRecoveryPhrase(phrase: string): Keypair {
  const seed = mnemonicToSeedSync(normalize(phrase));
  const { key } = derivePath(STELLAR_DERIVATION_PATH, Buffer.from(seed).toString("hex"));
  return Keypair.fromRawEd25519Seed(Buffer.from(key));
}
