import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

export { browserSupportsWebAuthn };

export interface PasskeySessionStatus {
  hasCredential: boolean;
  isAuthenticated: boolean;
  walletPublicKey: string | null;
}

async function requestJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "Request to the auth server failed.");
  }
  return data as T;
}

export async function getPasskeySessionStatus(): Promise<PasskeySessionStatus> {
  const response = await fetch("/api/auth/passkey/session", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Failed to check passkey session status.");
  }
  return response.json();
}

/** Registers a new passkey for this wallet on this device, then signs the session in. */
export async function registerPasskey(walletPublicKey: string): Promise<void> {
  const options = await requestJson<PublicKeyCredentialCreationOptionsJSON>(
    "/api/auth/passkey/register/options",
    { walletPublicKey },
  );
  const attestation = await startRegistration({ optionsJSON: options });
  await requestJson("/api/auth/passkey/register/verify", attestation);
}

/** Verifies the registered passkey and, on success, issues a signed session. */
export async function loginWithPasskey(): Promise<void> {
  const options = await requestJson<PublicKeyCredentialRequestOptionsJSON>(
    "/api/auth/passkey/login/options",
  );
  const assertion = await startAuthentication({ optionsJSON: options });
  await requestJson("/api/auth/passkey/login/verify", assertion);
}

export async function logoutPasskeySession(): Promise<void> {
  await requestJson("/api/auth/passkey/logout");
}

export function describePasskeyError(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "The passkey request was cancelled or timed out.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong with the passkey request.";
}
