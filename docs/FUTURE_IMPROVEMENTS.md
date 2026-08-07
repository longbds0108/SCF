# Future Improvements

Collected from the project audit and from scoping decisions made while building each feature —
each one is a deliberate "not now" with a reason, not an oversight discovered too late.

## Security & auth

- **PRF-based passkey key derivation.** The passkey gate currently sits in front of the
  existing password-protected wallet rather than replacing the password. WebAuthn's PRF
  extension is the correct mechanism to derive the wallet's AES-GCM key directly from the
  passkey, removing the password step entirely for supporting browsers — it wasn't used here
  because support isn't universal yet and a robust implementation needs a graceful fallback
  path for browsers/authenticators without it. See `src/features/auth/README.md` for the full
  reasoning.
- **Passkey recovery / removal.** There's currently no way to un-register a passkey if an
  authenticator is lost — only re-registering, which overwrites the stored credential. A
  "remove passkey" action (and ideally a recovery path that doesn't just lock someone out)
  is a real gap for anyone actually relying on this.
- **Multi-passkey / multi-device support.** One credential per browser (stored in a cookie,
  not a database — see the architecture doc for why). Registering a passkey on a second device
  currently overwrites rather than adds.
- **Signature counter regression alerting.** The updated counter from each login is stored
  correctly (`login/verify/route.ts`), which is the data needed to detect a cloned
  authenticator, but nothing currently compares it against the previous value and surfaces a
  warning if it goes backward.
- **Dependency vulnerabilities in transitive deps.** `npm audit` flags high-severity issues in
  `axios` (via `@stellar/stellar-sdk`/`@stellar/typescript-wallet-sdk`) and `postcss`/`sharp`
  (via `next`). Fixing them requires major-version bumps (`@stellar/stellar-sdk` 15→16,
  `next` 15→16) that weren't taken in this pass to avoid destabilizing everything already
  verified against the current versions — worth a dedicated upgrade pass with its own
  regression testing.

## Performance

- **Code-split the Soroban contract explorer.** `@stellar/stellar-sdk` is the single largest
  contributor to the ~912 kB first-load bundle, and the contract explorer is the one feature
  most users won't touch every session. A `next/dynamic` import with a loading fallback would
  keep that weight out of the initial load for everyone else.
- **No automated test suite.** Every SDK integration in this app was verified by hand against
  real testnet data (live Horizon/Soroban RPC calls, inspecting actual responses) rather than
  guessed from documentation — thorough for a one-time build, but nothing catches a regression
  automatically. Vitest for the service layer (pure functions, no React, straightforward to
  test) and Playwright for a few critical flows (create wallet → send → confirm on-chain) would
  close that gap.

## Features scaffolded but not implemented

- **`features/receive`** — address/QR display and SEP-7-style payment request links. The
  folder and README exist; no logic yet.
- **`features/settings`** — was scaffolded for theme, network selection, and passkey/device
  management in one place. Network switching ended up directly on `NetworkCard` and passkey
  management in `features/auth` instead, since both were small enough to not need a dedicated
  settings surface yet — worth consolidating if `settings` grows past those two.
- **Theme toggle.** `next-themes` is configured system-only (`enableSystem`, no manual
  override UI) — there's no way for a user to force light/dark independent of their OS setting.
- **Fee-bump / sponsorship.** `RELAYER_SPONSOR_SECRET_KEY` exists in `.env.example` and was
  clearly scaffolded for a "sponsor a new user's first transaction fee" feature — never built.
- **Multi-wallet support.** One wallet per browser, by design throughout this app (one
  encrypted blob in `localStorage`, one passkey credential cookie). Supporting multiple
  wallets would touch the storage layer, the session store, and the passkey credential
  format all at once.

## Known data gaps

- **`account_merge` amount isn't shown in transaction history.** Horizon's `/payments`
  endpoint doesn't include the merged amount on the operation record itself (unlike
  `payment`/`create_account`/path payments) — getting it would mean also querying the
  Effects API and correlating, which `listPayments` doesn't currently do. The row still
  renders (via the generic fallback), just without an amount.
