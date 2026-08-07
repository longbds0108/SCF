"use client";

import { useWalletSession } from "@/features/auth";
import { useTransactionHistory } from "@/features/transactions/hooks/use-transaction-history";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { QueryStateCard } from "@/components/query-state-card";
import { getExplorerTxUrl, type PaymentEntry } from "@/lib/stellar";
import { truncateMiddle } from "@/lib/utils";
import { useNetworkStore } from "@/stores/network-store";

function formatRelativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export function TransactionHistoryCard() {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    pageIndex,
    hasPrev,
    hasNext,
    goPrev,
    goNext,
  } = useTransactionHistory(network, publicKey);

  const columns: DataTableColumn<PaymentEntry>[] = [
    {
      key: "direction",
      header: "Direction",
      cell: (row) => (
        <Badge variant={row.direction === "incoming" ? "default" : "secondary"}>
          {row.direction === "incoming" ? "Incoming" : "Outgoing"}
        </Badge>
      ),
    },
    {
      key: "counterparty",
      header: "Counterparty",
      cell: (row) => (
        <span className="font-mono text-xs">
          {row.counterparty ? truncateMiddle(row.counterparty) : "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => <span className="font-medium">{row.amount ?? "—"}</span>,
    },
    {
      key: "asset",
      header: "Asset",
      cell: (row) => row.assetCode ?? "—",
    },
    {
      key: "memo",
      header: "Memo",
      cell: (row) => (
        <span className="block max-w-40 truncate text-muted-foreground">{row.memo ?? "—"}</span>
      ),
    },
    {
      key: "timestamp",
      header: "Time",
      cell: (row) => (
        <span
          className="whitespace-nowrap text-xs text-muted-foreground"
          title={new Date(row.createdAt).toLocaleString()}
        >
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.successful ? "outline" : "destructive"}>
          {row.successful ? "Success" : "Failed"}
        </Badge>
      ),
    },
    {
      key: "explorer",
      header: "",
      cell: (row) => (
        <a
          href={getExplorerTxUrl(network, row.transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-xs text-muted-foreground underline"
        >
          View
        </a>
      ),
    },
  ];

  return (
    <QueryStateCard
      title="Transaction History"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      className="sm:col-span-2 lg:col-span-3"
    >
      <div className="-mx-2 overflow-x-auto px-2">
        <DataTable
          columns={columns}
          rows={data?.entries ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No payments yet."
        />
      </div>
      <DataTablePagination
        pageIndex={pageIndex}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goPrev}
        onNext={goNext}
        isLoading={isFetching}
      />
    </QueryStateCard>
  );
}
