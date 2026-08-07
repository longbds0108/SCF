"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listPayments } from "@/lib/stellar";
import type { StellarNetwork } from "@/lib/network";

const PAGE_SIZE = 10;

/**
 * Cursor-based pagination: each page's fetch cursor is pushed onto a stack, so "Previous"
 * just steps back through already-fetched (and still React-Query-cached) pages instead of
 * re-deriving a backward cursor from Horizon.
 */
export function useTransactionHistory(network: StellarNetwork, publicKey: string | null) {
  const [cursorStack, setCursorStack] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setCursorStack([undefined]);
    setPageIndex(0);
  }, [network, publicKey]);

  const cursor = cursorStack[pageIndex];

  const query = useQuery({
    queryKey: ["transaction-history", network, publicKey, cursor, PAGE_SIZE],
    queryFn: () => listPayments(network, publicKey as string, { cursor, limit: PAGE_SIZE }),
    enabled: Boolean(publicKey),
    placeholderData: keepPreviousData,
  });

  function goNext() {
    const nextCursor = query.data?.nextCursor;
    if (!nextCursor) return;
    setCursorStack((stack) => [...stack.slice(0, pageIndex + 1), nextCursor]);
    setPageIndex((index) => index + 1);
  }

  function goPrev() {
    setPageIndex((index) => Math.max(0, index - 1));
  }

  return {
    ...query,
    pageIndex,
    hasPrev: pageIndex > 0,
    hasNext: Boolean(query.data?.nextCursor),
    goNext,
    goPrev,
  };
}
