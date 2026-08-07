# auth

Two independent layers, on purpose — see "Why two separate systems" below:

1. **Wallet session** — create/import/connect/disconnect a Stellar keypair, encrypted at rest
   with a password (WebCrypto AES-GCM, PBKDF2 key derivation), decrypted into an in-memory-only
   Zustand store on unlock. This is what actually signs Stellar transactions everywhere else in
   the app.
2. **Passkey authentication** — WebAuthn register/login/logout, backed by Next.js API routes
   under `src/app/api/auth/passkey/` using `@simplewebauthn/server`, with a signed-cookie
   session (`src/lib/session-cookie.ts`, `src/lib/auth-cookies.ts`). This gates _access to the
   app_, independent of the wallet's own password.

## Why two separate systems, not one

Stellar's actual, SDF-recommended passkey pattern (see the `passkey-kit` project and the
`secp256r1` host function added specifically to enable it) makes the **passkey itself the
Stellar signer**, via a Soroban smart-contract account that verifies WebAuthn signatures
on-chain. That is a materially different architecture from a classic ed25519 keypair wallet —
classic Stellar signature verification cannot check a WebAuthn/secp256r1 signature at all.

This app uses a classic keypair wallet (a deliberate earlier decision, for MVP simplicity —
see the `contracts` feature for the Soroban contract-interaction tooling that a future
smart-contract wallet would build on). Given that, there is no cryptographically sound way to
make a passkey directly BE the Stellar signing key here. Rather than build a passkey feature
that quietly does less than "Stellar passkey" usually implies, this implementation is scoped
honestly: **WebAuthn as a device-level authentication gate in front of the existing
password-protected wallet** — real 2FA-style defense in depth, not a signing mechanism. A
PRF-extension-based design (deriving the wallet's AES-GCM key straight from the passkey,
removing the password entirely) is a natural next step and is called out in Future
Improvements — WebAuthn's PRF extension isn't universally supported yet, so it needs a
fallback path this pass didn't have room for.

## Security considerations

**No backend user database.** This app has never had one — Horizon/Soroban RPC are the only
external services anything talks to. Rather than bolt one on just for WebAuthn credential
storage, the registered credential (id, public key, signature counter) is stored in a
tamper-evident cookie (`passkey_credential`, HMAC-SHA256-signed with `SESSION_SECRET`) instead
of a database row. This is sound _because a WebAuthn public key isn't confidential_ — the
security property that matters is that it can't be forged or altered, not that it's hidden,
and HMAC signing with constant-time comparison (`timingSafeEqual` in
`src/lib/session-cookie.ts`) provides exactly that. The practical cost: **one browser = one
passkey** for a given wallet. Clearing cookies or switching browsers means re-registering.

**Challenges are single-use and short-lived, not just decorative.** `generateRegistrationOptions`
/`generateAuthenticationOptions` produce a fresh random challenge every call; it's signed into
the `webauthn_challenge` cookie with a 5-minute expiry and deleted immediately after the
matching verify call consumes it. This is what stops a captured/replayed attestation or
assertion response from being reusable — verified with a real forged-cookie request during
testing (see below).

**Verification happens server-side, not in the browser.** All `verifyRegistrationResponse`/
`verifyAuthenticationResponse` calls run in Next.js API routes. A compromised or malicious
script in the page can call `navigator.credentials.get()` and see the raw assertion, but it
cannot forge a `session` cookie without the HMAC secret, which never reaches the client.

**Signature counter tracking.** Each login updates the stored credential's counter from
`authenticationInfo.newCounter` (see `login/verify/route.ts`). A counter that goes backward or
repeats on a future login is the standard signal that a cloned authenticator is being used —
this app tracks the counter correctly but does not yet actively alert on a regression; that's
a Future Improvement, not a gap in what's stored.

**`SESSION_SECRET` handling.** Required and validated at 32+ characters in production
(`src/lib/server-env.ts`); the app refuses to serve passkey routes without it. In development,
if unset, a random secret is generated once per server process with a console warning —
convenient for local testing, but it means dev sessions don't survive a server restart, and
this fallback is explicitly never taken when `NODE_ENV === "production"`.

**This gate does not protect the wallet secret itself.** Bypassing or skipping the passkey
gate (e.g., an attacker who somehow forges a `session` cookie) still lands on the _existing_
password-protected wallet screen — they'd still need the wallet password to decrypt anything.
The passkey layer's job is narrower and worth being precise about: it stops someone with an
already-unlocked device or browser tab from reaching even the password prompt without also
passing WebAuthn.

**Verified manually** (no browser automation was available for this pass): confirmed via curl
against the running dev server that (a) `register/options`/`login/options` validate input and
404 correctly when no credential exists, (b) a request carrying a forged/tampered
`webauthn_challenge` cookie is rejected rather than silently accepted, (c) `logout` correctly
clears the session cookie. A real end-to-end WebAuthn ceremony (an actual platform
authenticator prompt) still needs manual verification in a real browser before shipping.

## Intended structure

```
auth/
├── components/   UI components scoped to this feature
├── hooks/        React Query hooks and other feature-specific hooks
├── services/     Stellar/SDK calls and business logic, framework-agnostic
├── store/        Zustand store, only if the feature needs local client state
└── types/        TypeScript types and Zod schemas for this feature
```
