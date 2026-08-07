# API Documentation

This app has two kinds of "API": a small set of real HTTP endpoints for passkey
authentication, and the much larger surface of exported service/hook functions each feature
uses internally to talk to Stellar. Both are documented here.

## HTTP API — passkey authentication

All routes live under `/api/auth/passkey/`, accept/return JSON, and rely on cookies for state
(no `Authorization` header — the browser sends cookies automatically for same-origin
requests). See [`src/features/auth/README.md`](../src/features/auth/README.md) for the
security reasoning behind this design.

### `POST /api/auth/passkey/register/options`

Starts registration. Sets a signed `webauthn_challenge` cookie (5 min expiry).

**Request body:** `{ "walletPublicKey": string }`

**Response:** `PublicKeyCredentialCreationOptionsJSON` (pass directly to
`@simplewebauthn/browser`'s `startRegistration`).

**Errors:** `400` if `walletPublicKey` is missing or empty.

### `POST /api/auth/passkey/register/verify`

Completes registration. Reads and consumes the `webauthn_challenge` cookie. On success, sets
`passkey_credential` (1 year) and `session` (7 days) cookies.

**Request body:** the `RegistrationResponseJSON` returned by `startRegistration`.

**Response:** `{ "verified": true }`

**Errors:** `400` if the challenge cookie is missing/expired/tampered, or if
`verifyRegistrationResponse` rejects the attestation.

### `POST /api/auth/passkey/login/options`

Starts a login (assertion) ceremony. Requires a `passkey_credential` cookie to already exist
(you can't log in with a passkey that was never registered on this device/browser). Sets a
fresh `webauthn_challenge` cookie.

**Request body:** none.

**Response:** `PublicKeyCredentialRequestOptionsJSON` (pass to `startAuthentication`).

**Errors:** `404` if no credential is registered yet.

### `POST /api/auth/passkey/login/verify`

Completes login. Reads and consumes the `webauthn_challenge` cookie, verifies the assertion
against the stored credential's public key, updates the stored signature counter, and on
success issues a fresh `session` cookie.

**Request body:** the `AuthenticationResponseJSON` returned by `startAuthentication`.

**Response:** `{ "verified": true }`

**Errors:** `400` if the challenge or credential cookie is missing, or verification fails.

### `POST /api/auth/passkey/logout`

Clears the `session` cookie. Does not clear `passkey_credential` — logging out just requires
WebAuthn again on the next visit, it doesn't un-register the passkey.

**Request/response:** none / `{ "loggedOut": true }`

### `GET /api/auth/passkey/session`

Reports current state. Used on every page load to decide whether to show the passkey gate.

**Response:**

```json
{
  "hasCredential": boolean,
  "isAuthenticated": boolean,
  "walletPublicKey": string | null
}
```

---

## Service-layer API (internal, TypeScript)

Every feature exports its public surface through `src/features/<name>/index.ts`. These are
plain async functions — framework-agnostic, independently testable, no React involved — that
the hooks layer wraps in `useQuery`/`useMutation`. This is the layer to read if you're
extending a feature or writing a script against the same Stellar logic the UI uses.

### `lib/stellar.ts` — shared Horizon/account primitives

| Function                                                                     | Purpose                                                                             |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `getHorizonServer(network)` / `getRpcServer(network)` / `getWallet(network)` | Cached SDK client factories — one instance per network, shared across every feature |
| `loadAccount`, `getBalances`, `accountExists`, `hasTrustline`                | Account state reads                                                                 |
| `listPayments(network, publicKey, { limit, cursor })`                        | Paginated payment history (powers the transactions feature)                         |
| `getUsdcAsset(network)`                                                      | The configured USDC `IssuedAssetId` for a network                                   |
| `submitTransaction`, `getExplorerTxUrl`, `describeStellarSubmitError`        | Submission and shared error/display helpers                                         |

### `features/send` — `sendXlm`, `sendUsdc`, `previewSendXlm`, `previewSendUsdc`

Preview functions validate the destination/amount and check preconditions (does the
destination exist, does it have the right trustline) without building a transaction. The send
functions build fresh (not reusing the preview's transaction, to avoid a stale sequence
number), sign, and submit.

### `features/trustlines` — `addTrustline`, `removeTrustline`, `toTrustlines`

`removeTrustline` checks the balance is zero client-side before attempting the operation,
since Horizon rejects `changeTrust(limit: 0)` outright otherwise with a much less actionable
error.

### `features/contracts` — `connectContract`, `simulateContractCall`, `invokeContract`, `readContractStorage`

Thin, direct wrappers over `@stellar/stellar-sdk`'s `Contract` and `rpc.Server` — see
[`src/features/contracts/README.md`](../src/features/contracts/README.md) for the full
rationale, especially why "connect" and "simulate vs. invoke" mean what they mean for a
stateless RPC protocol.

### `features/auth` — wallet session + passkey

`createWallet`, `importWallet`, `unlockWallet` (password-encrypted keypair session) are
separate from `registerPasskey`, `loginWithPasskey`, `logoutPasskeySession` (WebAuthn) — see
the architecture doc for why these are two independent systems rather than one.
