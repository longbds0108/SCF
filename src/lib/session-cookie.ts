import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Base64url(JSON payload) + "." + HMAC-SHA256 signature — tamper-evident, not encrypted. */
export function encodeSignedValue(data: unknown, secret: string): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Verifies the signature with a constant-time comparison (timingSafeEqual) before trusting
 * the payload — a naive `===` here would leak how many leading bytes matched via response
 * timing, letting an attacker forge a valid signature byte-by-byte.
 */
export function decodeSignedValue<T>(value: string | undefined | null, secret: string): T | null {
  if (!value) return null;

  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expected = sign(payload, secret);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as T;
  } catch {
    return null;
  }
}
