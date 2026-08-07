import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  CHALLENGE_COOKIE,
  CHALLENGE_TTL_SECONDS,
  CREDENTIAL_COOKIE,
  cookieBaseOptions,
  type ChallengePayload,
  type CredentialPayload,
} from "@/lib/auth-cookies";
import { getServerEnv } from "@/lib/server-env";
import { decodeSignedValue, encodeSignedValue } from "@/lib/session-cookie";

export async function POST() {
  const serverEnv = getServerEnv();
  const cookieStore = await cookies();
  const credential = decodeSignedValue<CredentialPayload>(
    cookieStore.get(CREDENTIAL_COOKIE)?.value,
    serverEnv.SESSION_SECRET,
  );

  if (!credential) {
    return NextResponse.json(
      { error: "No passkey registered on this device yet." },
      { status: 404 },
    );
  }

  const options = await generateAuthenticationOptions({
    rpID: serverEnv.WEBAUTHN_RP_ID,
    allowCredentials: [{ id: credential.id }],
    userVerification: "preferred",
  });

  const challengePayload: ChallengePayload = {
    challenge: options.challenge,
    walletPublicKey: credential.walletPublicKey,
  };
  cookieStore.set(CHALLENGE_COOKIE, encodeSignedValue(challengePayload, serverEnv.SESSION_SECRET), {
    ...cookieBaseOptions,
    maxAge: CHALLENGE_TTL_SECONDS,
  });

  return NextResponse.json(options);
}
