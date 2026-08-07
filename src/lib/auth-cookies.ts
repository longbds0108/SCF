import "server-only";

export const CHALLENGE_COOKIE = "webauthn_challenge";
export const CREDENTIAL_COOKIE = "passkey_credential";
export const SESSION_COOKIE = "session";

/** Seconds. Short-lived — only needs to survive the round trip to the authenticator. */
export const CHALLENGE_TTL_SECONDS = 5 * 60;
/** Seconds. The registered passkey itself; expiring it just means re-registering. */
export const CREDENTIAL_TTL_SECONDS = 60 * 60 * 24 * 365;
/** Seconds. How long a completed login stays valid before WebAuthn is required again. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface ChallengePayload {
  challenge: string;
  walletPublicKey: string;
}

export interface CredentialPayload {
  id: string;
  publicKey: string; // base64-encoded raw public key bytes
  counter: number;
  walletPublicKey: string;
}

export interface SessionPayload {
  walletPublicKey: string;
  issuedAt: number;
}

export const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};
