# Deployment Guide

This is a standard Next.js 15 App Router app with a handful of API routes (the passkey
endpoints) — it deploys anywhere Next.js does. No database, no queue, no background jobs.

## Before you deploy: things that only work correctly with real production config

1. **`SESSION_SECRET` must be set.** The app _will refuse to serve the passkey routes_
   without one at least 32 characters long when `NODE_ENV=production` (see
   `src/lib/server-env.ts`) — this is intentional, not a bug to work around. Generate one with:

   ```bash
   openssl rand -base64 32
   ```

   Set it as a genuine secret in your host's environment configuration, never committed.

2. **`WEBAUTHN_RP_ID` and `WEBAUTHN_ORIGIN` must match your real deployed domain exactly.**
   `WEBAUTHN_RP_ID` is the bare domain (e.g. `wallet.example.com`, no scheme, no port).
   `WEBAUTHN_ORIGIN` is the full origin (`https://wallet.example.com`). A mismatch here doesn't
   error loudly — it just makes every passkey verification fail, since WebAuthn's whole
   security model is built on binding credentials to a specific origin. Passkeys registered
   against `localhost` in development will not work in production; that's expected, not a bug.

3. **Mainnet Soroban RPC needs a paid provider.** `NEXT_PUBLIC_SOROBAN_RPC_URL_MAINNET` ships
   blank in `.env.example` on purpose — Stellar doesn't run a free public mainnet RPC the way
   it does for Horizon. Get an endpoint from a provider (Blockdaemon, Validation Cloud, QuickNode,
   etc.) before enabling mainnet, or the Soroban contract explorer and any mainnet contract
   interaction will fail outright on that network.

4. **Re-verify the USDC issuer addresses before trusting them with real funds.** The defaults
   in `.env.example` are Circle's published Stellar addresses, cross-checked against
   `developers.circle.com/stablecoins/usdc-contract-addresses` and validated with `StrKey` at
   the time this was built — re-verify against Circle's current documentation before a mainnet
   launch, since issuer addresses are exactly the kind of thing worth not trusting blindly from
   a document that could be stale by the time you read it.

## Deploying to Vercel (recommended for this stack)

1. Push to a Git provider Vercel can connect to (GitHub, GitLab, Bitbucket).
2. Import the project in the Vercel dashboard, or `vercel` from the CLI.
3. Set environment variables in the Vercel project settings — everything from `.env.example`,
   with `WEBAUTHN_RP_ID`/`WEBAUTHN_ORIGIN` set to the Vercel-assigned or custom domain, and a
   real `SESSION_SECRET`.
4. Deploy. Vercel builds with `npm run build` and serves the API routes as serverless
   functions automatically — no extra configuration needed for those.

**Serverless caveat:** the dev-mode fallback that auto-generates a `SESSION_SECRET` per
process (see `src/lib/server-env.ts`) only ever activates when `NODE_ENV !== "production"`,
and Vercel sets `NODE_ENV=production` for deployed builds — so this isn't a footgun there, but
it's worth knowing that on any platform, if `SESSION_SECRET` were somehow unset in a
production-flagged environment, the passkey routes throw rather than silently using a
per-instance random secret (which would invalidate sessions non-deterministically across
serverless instances).

## Deploying to any Node host (self-hosted, Docker, Railway, Fly.io, etc.)

```bash
npm ci
npm run build
npm run start   # serves on port 3000 by default; set PORT to override
```

Anything that can run `npm run start` behind a reverse proxy (nginx, Caddy) works. Make sure
the proxy forwards the real client IP and sets `X-Forwarded-Proto: https` if TLS terminates
upstream — WebAuthn requires HTTPS in production (`http://localhost` is allowed as a
development-only exception in browsers, nothing else is).

## Post-deploy checklist

- [ ] `SESSION_SECRET` set (32+ chars, kept out of version control)
- [ ] `WEBAUTHN_RP_ID` / `WEBAUTHN_ORIGIN` match the real domain exactly
- [ ] `NEXT_PUBLIC_STELLAR_NETWORK` set deliberately (defaults to `testnet` — don't ship a
      "mainnet wallet" that's silently still pointed at testnet, or vice versa)
- [ ] If enabling mainnet: `NEXT_PUBLIC_SOROBAN_RPC_URL_MAINNET` set to a real provider
- [ ] USDC issuer addresses re-verified against Circle's current documentation
- [ ] Register a passkey once post-deploy and confirm a full register → logout → login →
      logout round trip works against the real domain (this cannot be verified in development
      against `localhost` in a way that guarantees it'll also work on the real origin)
- [ ] `npm run build` passes with zero warnings in the exact environment you're deploying from
