# Stellar Wallet

A Stellar wallet built with Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, React
Query, Zustand, and Zod. Classic Stellar payments (XLM and issued assets like USDC), trustline
management, a paginated transaction history, generic Soroban contract interaction, and an
optional WebAuthn passkey gate — all client-first, with no backend database.

## Features

- **Wallet** — create, import, connect, and disconnect a Stellar keypair. Encrypted at rest in
  `localStorage` with WebCrypto AES-GCM (PBKDF2-derived key); decrypted into an
  in-memory-only session on unlock, never persisted in plaintext.
- **Dashboard** — address, network, XLM/USDC balances, sequence number, all on a shared,
  auto-refreshing React Query cache.
- **Send** — XLM and USDC payments with destination/amount/memo validation, a preview-then-
  confirm step, and a live explorer link on success.
- **Trustlines** — view, add, and remove trustlines for any issued asset, with balance-aware
  guards (Stellar won't let you remove a trustline you still hold a balance on).
- **Transaction history** — paginated, using Horizon's `/payments` endpoint for real
  incoming/outgoing/amount/asset/memo/status data, not just a raw transaction list.
- **Soroban contracts** — connect to any deployed contract by address, simulate calls, invoke
  them for real, and read contract storage directly, all through the official
  `@stellar/stellar-sdk` `rpc.Server`/`Contract` APIs.
- **Passkey authentication** — an optional WebAuthn device gate in front of the wallet, backed
  by real server-side verification (`@simplewebauthn/server`) and a signed session cookie. See
  [`src/features/auth/README.md`](src/features/auth/README.md) for what this does and
  doesn't protect, and why.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the pieces fit together, with a diagram.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deploying to Vercel or any Node host.
- [`docs/API.md`](docs/API.md) — the passkey API routes and each feature's public service API.
- [`docs/FUTURE_IMPROVEMENTS.md`](docs/FUTURE_IMPROVEMENTS.md) — known gaps and next steps.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`, create a wallet, and fund it on testnet via
[Friendbot](https://developers.stellar.org/docs/learn/fundamentals/networks#friendbot) using
the address shown on the dashboard.

## Environment variables

See [`.env.example`](.env.example) for the full list with inline explanations. The short
version:

- Everything `NEXT_PUBLIC_*` ships to the browser (Horizon/RPC URLs, the USDC issuer). All
  have working defaults for testnet.
- `WEBAUTHN_RP_ID` / `WEBAUTHN_RP_NAME` / `WEBAUTHN_ORIGIN` configure the passkey feature;
  defaults work for local development.
- `SESSION_SECRET` signs the passkey session cookie. Required in production (32+ characters —
  generate with `openssl rand -base64 32`); auto-generated per-process in development if unset.
- `RELAYER_SPONSOR_SECRET_KEY` is reserved for a future fee-sponsorship feature — unused today,
  see Future Improvements.

## Project structure

```
src/
├── app/                    Next.js App Router: pages, root layout, error boundaries,
│                           and the passkey API routes under app/api/auth/passkey/
├── components/             Shared, feature-agnostic UI (shadcn/ui primitives, DataTable,
│                           QueryStateCard, JsonValue)
├── features/                Feature-based modules — see each feature's own README.md
│   ├── auth/                Wallet session (password-encrypted keypair) + passkey auth
│   ├── wallet/               Dashboard balance/sequence/address cards
│   ├── send/                 Send XLM / Send USDC flows
│   ├── trustlines/           Trustline display, add, remove
│   ├── transactions/         Paginated payment history
│   ├── contracts/            Soroban contract explorer
│   ├── receive/              Scaffolded, not yet implemented
│   └── settings/             Scaffolded, not yet implemented
├── lib/                     Cross-cutting infrastructure: Stellar/Soroban SDK wrappers
│                           (stellar.ts), env validation (env.ts, server-env.ts), the signed-
│                           cookie helper, React Query client config, utils
└── stores/                  Cross-cutting Zustand stores (active network)
```

Each feature follows the same internal convention — `services/` (SDK calls, framework-
agnostic), `hooks/` (React Query wrappers), `components/` (UI), `types/` (Zod schemas) — so
business logic, data fetching, and presentation stay separated consistently across the app.

## Scripts

| Command                           | Purpose              |
| --------------------------------- | -------------------- |
| `npm run dev`                     | Start the dev server |
| `npm run build`                   | Production build     |
| `npm run lint` / `lint:fix`       | ESLint               |
| `npm run format` / `format:check` | Prettier             |
| `npm run typecheck`               | `tsc --noEmit`       |
