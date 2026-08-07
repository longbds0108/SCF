import { InvalidPasswordError } from "./wallet-errors";

/**
 * AES-GCM with a PBKDF2-derived key (WebCrypto, browser-native — no extra crypto dependency).
 * 210,000 PBKDF2-SHA256 iterations follows OWASP's 2023 minimum recommendation for that
 * algorithm. GCM's authentication tag is what turns a wrong password into a hard decrypt
 * failure instead of silently returning garbage bytes.
 */
const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  salt: string;
  iterations: number;
}

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(secret: string, password: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(secret),
  );

  return {
    cipherText: toBase64(cipherBuffer),
    iv: toBase64(iv),
    salt: toBase64(salt),
    iterations: PBKDF2_ITERATIONS,
  };
}

export async function decryptSecret(payload: EncryptedPayload, password: string): Promise<string> {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const key = await deriveKey(password, salt, payload.iterations);

  try {
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      fromBase64(payload.cipherText) as BufferSource,
    );
    return new TextDecoder().decode(plainBuffer);
  } catch {
    throw new InvalidPasswordError();
  }
}
