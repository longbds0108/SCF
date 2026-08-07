"use client";

import { useMutation } from "@tanstack/react-query";

import { connectContract } from "@/features/contracts/services/contract-service";
import type { StellarNetwork } from "@/lib/network";

export function useConnectContract(network: StellarNetwork) {
  return useMutation({
    mutationFn: (contractId: string) => connectContract(network, contractId),
  });
}
