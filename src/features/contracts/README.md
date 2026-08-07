# contracts

Generic Soroban smart contract interaction: connect to any deployed contract by address,
simulate calls, invoke them for real, and read storage directly — all built on the official
`@stellar/stellar-sdk` `rpc.Server` and `Contract` APIs, no custom RPC wrapping.

- `services/contract-service.ts` — the actual SDK calls (`getLedgerEntries` for existence
  checks, `simulateTransaction`/`prepareTransaction`/`sendTransaction`/`pollTransaction` for
  the invoke lifecycle, `getContractData` for storage reads), plus `nativeToScVal`/
  `scValToNative` conversion between the UI's typed inputs and Soroban's XDR values.
- `hooks/` — one React Query mutation per service action (connect, simulate, invoke, read
  storage); each hook is a thin wrapper, no logic of its own.
- `components/` — `ConnectContractForm`, `ContractArgsEditor` (reusable — used for both
  invoke arguments and a storage-read key), `ContractResponseCard` (reusable — used for
  simulation, invoke, and storage results alike), composed into `ContractExplorerCard`.

**Connecting** is stateless — Soroban RPC has no session concept — so "connect" just means
confirming the contract's instance ledger entry actually resolves before letting the user try
to call it, rather than hitting a confusing error on the first real invocation.

**Simulate vs. invoke**: simulation never touches the ledger, so it's always safe to run,
even against functions that would mutate state if actually invoked. Invoke signs and submits
for real, using `prepareTransaction` to auto-assemble the footprint/auth/fee from simulation
rather than doing that assembly by hand.
