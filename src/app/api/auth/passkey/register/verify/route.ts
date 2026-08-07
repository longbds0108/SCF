import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
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
  const body = (await request.json().catch(() => null)) as RegistrationResponseJSON | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const serverEnv = getServerEnv();
  const cookieStore = await cookies();
  const challengePayload = decodeSignedValue<ChallengePayload>(
    cookieStore.get(CHALLENGE_COOKIE)?.value,
    serverEnv.SESSION_SECRET,
  );

  if (!challengePayload) {
    return NextResponse.json(
      { error: "Registration session expired or invalid — try again." },
      { status: 400 },
    );
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengePayload.challenge,
      expectedOrigin: serverEnv.WEBAUTHN_ORIGIN,
      expectedRPID: serverEnv.WEBAUTHN_RP_ID,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration verification failed." },
      { status: 400 },
    );
  }

  cookieStore.delete(CHALLENGE_COOKIE);

  if (!verification.verified) {
    return NextResponse.json(
      { error: "Passkey registration could not be verified." },
      { status: 400 },
    );
  }

  const { credential } = verification.registrationInfo;
  const credentialPayload: CredentialPayload = {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64"),
    counter: credential.counter,
    walletPublicKey: challengePayload.walletPublicKey,
  };

  cookieStore.set(
    CREDENTIAL_COOKIE,
    encodeSignedValue(credentialPayload, serverEnv.SESSION_SECRET),
    {
      ...cookieBaseOptions,
      maxAge: CREDENTIAL_TTL_SECONDS,
    },
  );

  // Registering just proved presence — sign the user straight into a session too.
  const sessionPayload: SessionPayload = {
    walletPublicKey: challengePayload.walletPublicKey,
    issuedAt: Date.now(),
  };
  cookieStore.set(SESSION_COOKIE, encodeSignedValue(sessionPayload, serverEnv.SESSION_SECRET), {
    ...cookieBaseOptions,
    maxAge: SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ verified: true });
}
