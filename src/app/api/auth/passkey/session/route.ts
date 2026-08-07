import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  CREDENTIAL_COOKIE,
  SESSION_COOKIE,
  type CredentialPayload,
  type SessionPayload,
} from "@/lib/auth-cookies";
import { getServerEnv } from "@/lib/server-env";
import { decodeSignedValue } from "@/lib/session-cookie";

export async function GET() {
  const serverEnv = getServerEnv();
  const cookieStore = await cookies();

  const credential = decodeSignedValue<CredentialPayload>(
    cookieStore.get(CREDENTIAL_COOKIE)?.value,
    serverEnv.SESSION_SECRET,
  );
  const session = decodeSignedValue<SessionPayload>(
    cookieStore.get(SESSION_COOKIE)?.value,
    serverEnv.SESSION_SECRET,
  );

  return NextResponse.json({
    hasCredential: credential !== null,
    isAuthenticated: session !== null,
    walletPublicKey: session?.walletPublicKey ?? credential?.walletPublicKey ?? null,
  });
}
