"use client";

import { rpc } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { readContractStorage } from "@/features/contracts/services/contract-service";
import type { ContractArgInput } from "@/features/contracts/types/contract";
import type { StellarNetwork } from "@/lib/network";

interface ReadStorageParams {
  contractId: string;
  key: ContractArgInput;
  durability: rpc.Durability;
}

export function useReadContractStorage(network: StellarNetwork) {
  return useMutation({
    mutationFn: ({ contractId, key, durability }: ReadStorageParams) =>
      readContractStorage(network, contractId, key, durability),
  });
}
