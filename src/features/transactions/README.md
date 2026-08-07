# transactions

Paginated payment history for the connected account, sourced from Horizon's `/payments`
endpoint (not `/transactions`) — that's the operation-level view, which is what gives us
direction (incoming/outgoing), amount, and asset directly instead of a second lookup per
transaction. `join=transactions` embeds each operation's parent transaction so the memo comes
along for free.

- `lib/stellar.ts` (`listPayments`) does the Horizon call and record-shape mapping.
- `hooks/use-transaction-history.ts` adds cursor-stack pagination on top via React Query.
- `components/transaction-history-card.tsx` renders it using the shared `DataTable` /
  `DataTablePagination` components from `src/components/` — those two are generic and
  reusable for any other paginated table in the app, not specific to this feature.

Supported operation types: `payment`, `create_account`, `path_payment_strict_receive`,
`path_payment_strict_send`, `account_merge` (best-effort). Anything else Horizon's
`/payments` endpoint might return (e.g. Soroban `invoke_host_function`) still renders a row
via a generic fallback rather than being dropped or crashing the table.
