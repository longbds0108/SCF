import { generateRegistrationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { CHALLENGE_COOKIE, CHALLENGE_TTL_SECONDS, cookieBaseOptions } from "@/lib/auth-cookies";
import { getServerEnv } from "@/lib/server-env";
import { encodeSignedValue } from "@/lib/session-cookie";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const walletPublicKey = body?.walletPublicKey;

  if (typeof walletPublicKey !== "string" || walletPublicKey.length === 0) {
    return NextResponse.json({ error: "walletPublicKey is required." }, { status: 400 });
  }

  const serverEnv = getServerEnv();
  const options = await generateRegistrationOptions({
    rpName: serverEnv.WEBAUTHN_RP_NAME,
    rpID: serverEnv.WEBAUTHN_RP_ID,
    userName: walletPublicKey,
    userDisplayName: `${walletPublicKey.slice(0, 4)}…${walletPublicKey.slice(-4)}`,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    CHALLENGE_COOKIE,
    encodeSignedValue({ challenge: options.challenge, walletPublicKey }, serverEnv.SESSION_SECRET),
    { ...cookieBaseOptions, maxAge: CHALLENGE_TTL_SECONDS },
  );

  return NextResponse.json(options);
}
