"use client";

import type { Keypair } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { invokeContract } from "@/features/contracts/services/contract-service";
import type { ContractArgInput } from "@/features/contracts/types/contract";
import type { StellarNetwork } from "@/lib/network";

interface InvokeParams {
  keypair: Keypair;
  contractId: string;
  method: string;
  args: ContractArgInput[];
}

export function useInvokeContract(network: StellarNetwork) {
  return useMutation({
    mutationFn: ({ keypair, contractId, method, args }: InvokeParams) =>
      invokeContract(network, keypair, contractId, method, args),
  });
}
