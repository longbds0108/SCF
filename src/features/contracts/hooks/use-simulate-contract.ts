"use client";

import { useMutation } from "@tanstack/react-query";

import { simulateContractCall } from "@/features/contracts/services/contract-service";
import type { ContractArgInput } from "@/features/contracts/types/contract";
import type { StellarNetwork } from "@/lib/network";

interface SimulateParams {
  sourcePublicKey: string;
  contractId: string;
  method: string;
  args: ContractArgInput[];
}

export function useSimulateContract(network: StellarNetwork) {
  return useMutation({
    mutationFn: ({ sourcePublicKey, contractId, method, args }: SimulateParams) =>
      simulateContractCall(network, sourcePublicKey, contractId, method, args),
  });
}
