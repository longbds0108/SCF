import "server-only";

import { randomBytes } from "crypto";
import { z } from "zod";

/**
 * Server-only environment — never imported from a "use client" module or anything reachable
 * from one. The `server-only` import above makes an accidental client import a build error
 * rather than a silent leak of SESSION_SECRET into the browser bundle.
 *
 * Resolved lazily (on first real use inside a request handler) rather than at module import
 * time: `next build` imports route modules during its page-data-collection pass with
 * NODE_ENV=production already set, so a top-level throw here would fail the build itself
 * even when no request has actually happened yet.
 */
const serverEnvSchema = z.object({
  WEBAUTHN_RP_ID: z.string().min(1).default("localhost"),
  WEBAUTHN_RP_NAME: z.string().min(1).default("Stellar Wallet"),
  WEBAUTHN_ORIGIN: z.string().url().default("http://localhost:3000"),
});

function resolveSessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set in production (32+ chars) — generate with `openssl rand -base64 32`.",
    );
  }

  // Dev-only fallback: a random secret generated once per server process, so local testing
  // works with zero setup. Sessions won't survive a dev-server restart, and this path is
  // never taken when NODE_ENV === "production" (see the throw above).
  console.warn(
    "[auth] SESSION_SECRET is not set — using a random development-only secret that will " +
      "change on every restart. Set SESSION_SECRET in .env.local before deploying.",
  );
  return randomBytes(32).toString("base64");
}

let cachedServerEnv: {
  WEBAUTHN_RP_ID: string;
  WEBAUTHN_RP_NAME: string;
  WEBAUTHN_ORIGIN: string;
  SESSION_SECRET: string;
} | null = null;

export function getServerEnv() {
  if (cachedServerEnv) return cachedServerEnv;

  const parsedEnv = serverEnvSchema.parse({
    WEBAUTHN_RP_ID: process.env.WEBAUTHN_RP_ID,
    WEBAUTHN_RP_NAME: process.env.WEBAUTHN_RP_NAME,
    WEBAUTHN_ORIGIN: process.env.WEBAUTHN_ORIGIN,
  });

  cachedServerEnv = { ...parsedEnv, SESSION_SECRET: resolveSessionSecret() };
  return cachedServerEnv;
}
