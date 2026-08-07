import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  CHALLENGE_COOKIE,
  CREDENTIAL_COOKIE,
  CREDENTIAL_TTL_SECONDS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  cookieBaseOptions,
  type ChallengePayload,
  type CredentialPayload,
  type SessionPayload,
} from "@/lib/auth-cookies";
import { getServerEnv } from "@/lib/server-env";
import { decodeSignedValue, encodeSignedValue } from "@/lib/session-cookie";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AuthenticationResponseJSON | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const serverEnv = getServerEnv();
  const cookieStore = await cookies();
  const challengePayload = decodeSignedValue<ChallengePayload>(
    cookieStore.get(CHALLENGE_COOKIE)?.value,
    serverEnv.SESSION_SECRET,
  );
  const credentialPayload = decodeSignedValue<CredentialPayload>(
    cookieStore.get(CREDENTIAL_COOKIE)?.value,
    serverEnv.SESSION_SECRET,
  );

  if (!challengePayload || !credentialPayload) {
    return NextResponse.json(
      { error: "Login session expired or no passkey registered — try again." },
      { status: 400 },
    );
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengePayload.challenge,
      expectedOrigin: serverEnv.WEBAUTHN_ORIGIN,
      expectedRPID: serverEnv.WEBAUTHN_RP_ID,
      credential: {
        id: credentialPayload.id,
        publicKey: new Uint8Array(Buffer.from(credentialPayload.publicKey, "base64")),
        counter: credentialPayload.counter,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login verification failed." },
      { status: 400 },
    );
  }

  cookieStore.delete(CHALLENGE_COOKIE);

  if (!verification.verified) {
    return NextResponse.json({ error: "Passkey login could not be verified." }, { status: 400 });
  }

  // Persist the updated signature counter — a stale/decreasing counter on a future login is
  // one of the signals authenticator cloning leaves behind.
  const updatedCredential: CredentialPayload = {
    ...credentialPayload,
    counter: verification.authenticationInfo.newCounter,
  };
  cookieStore.set(
    CREDENTIAL_COOKIE,
    encodeSignedValue(updatedCredential, serverEnv.SESSION_SECRET),
    {
      ...cookieBaseOptions,
      maxAge: CREDENTIAL_TTL_SECONDS,
    },
  );

  const sessionPayload: SessionPayload = {
    walletPublicKey: credentialPayload.walletPublicKey,
    issuedAt: Date.now(),
  };
  cookieStore.set(SESSION_COOKIE, encodeSignedValue(sessionPayload, serverEnv.SESSION_SECRET), {
    ...cookieBaseOptions,
    maxAge: SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ verified: true });
}
