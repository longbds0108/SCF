import {
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
  type Keypair,
} from "@stellar/stellar-sdk";

import { getNetworkConfig, type StellarNetwork } from "@/lib/network";
import { getRpcServer, isValidContractId } from "@/lib/stellar";
import type { ContractArgInput } from "@/features/contracts/types/contract";

export class ContractNotFoundError extends Error {
  constructor(contractId: string) {
    super(`No contract found at "${contractId}" on this network.`);
    this.name = "ContractNotFoundError";
  }
}

export class ContractSimulationError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "ContractSimulationError";
  }
}

export class ContractInvocationError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "ContractInvocationError";
  }
}

export interface ContractConnection {
  contractId: string;
  latestLedger: number;
}

export interface SimulationResult {
  resultValue: unknown;
  minResourceFee: string;
  needsRestore: boolean;
}

export interface InvokeResult {
  hash: string;
  resultValue: unknown;
}

export interface ContractStorageEntry {
  value: unknown;
  liveUntilLedgerSeq?: number;
  lastModifiedLedgerSeq?: number;
}

/** Builds the ScVal for one typed arg/key input — the inverse of scValToNative for display. */
export function buildScVal(arg: ContractArgInput): xdr.ScVal {
  const value = arg.value.trim();
  switch (arg.type) {
    case "bool":
      return nativeToScVal(value === "true", { type: "bool" });
    case "u32":
    case "i32":
      return nativeToScVal(Number(value), { type: arg.type });
    case "u64":
    case "i64":
    case "u128":
    case "i128":
      return nativeToScVal(BigInt(value), { type: arg.type });
    case "address":
      return nativeToScVal(value, { type: "address" });
    case "bytes":
      return nativeToScVal(Buffer.from(value, "hex"), { type: "bytes" });
    case "symbol":
      return nativeToScVal(value, { type: "symbol" });
    case "string":
    default:
      return nativeToScVal(value, { type: "string" });
  }
}

/**
 * "Connecting" to a contract is stateless (Soroban RPC has no persistent session) — this
 * confirms the contract actually exists on-chain before the UI lets the user try to call it,
 * by checking its footprint (the contract-instance ledger entry) resolves to something.
 */
export async function connectContract(
  network: StellarNetwork,
  contractId: string,
): Promise<ContractConnection> {
  if (!isValidContractId(contractId)) {
    throw new Error(`"${contractId}" is not a valid contract address (should start with C).`);
  }

  const server = getRpcServer(network);
  const contract = new Contract(contractId);
  const response = await server.getLedgerEntries(contract.getFootprint());

  if (response.entries.length === 0) {
    throw new ContractNotFoundError(contractId);
  }

  return { contractId, latestLedger: response.latestLedger };
}

/** Builds an unsigned invoke-host-function transaction — shared by simulate and invoke. */
async function buildInvocationTransaction(
  network: StellarNetwork,
  sourcePublicKey: string,
  contractId: string,
  method: string,
  args: ContractArgInput[],
) {
  const server = getRpcServer(network);
  const sourceAccount = await server.getAccount(sourcePublicKey);
  const contract = new Contract(contractId);
  const scArgs = args.map(buildScVal);
  const { networkPassphrase } = getNetworkConfig(network);

  return new TransactionBuilder(sourceAccount, { fee: BASE_FEE, networkPassphrase })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(30)
    .build();
}

/**
 * Read-only preview: simulates the call and returns the parsed result without signing or
 * submitting anything. Safe to run for any function, including ones that would mutate state
 * if actually invoked — simulation never touches the ledger.
 */
export async function simulateContractCall(
  network: StellarNetwork,
  sourcePublicKey: string,
  contractId: string,
  method: string,
  args: ContractArgInput[],
): Promise<SimulationResult> {
  const transaction = await buildInvocationTransaction(
    network,
    sourcePublicKey,
    contractId,
    method,
    args,
  );
  const server = getRpcServer(network);
  const sim = await server.simulateTransaction(transaction);

  if (rpc.Api.isSimulationError(sim)) {
    throw new ContractSimulationError(sim.error);
  }

  return {
    resultValue: sim.result ? scValToNative(sim.result.retval) : undefined,
    minResourceFee: sim.minResourceFee,
    needsRestore: rpc.Api.isSimulationRestore(sim),
  };
}

/**
 * Simulates, signs, submits, and polls for a definitive result. Uses `prepareTransaction`
 * (simulate + auto-assemble footprint/auth/fee) rather than calling simulate manually, since
 * there's no need to inspect the simulation separately here — simulateContractCall already
 * covers the "preview first" case.
 */
export async function invokeContract(
  network: StellarNetwork,
  signerKeypair: Keypair,
  contractId: string,
  method: string,
  args: ContractArgInput[],
): Promise<InvokeResult> {
  const server = getRpcServer(network);
  const transaction = await buildInvocationTransaction(
    network,
    signerKeypair.publicKey(),
    contractId,
    method,
    args,
  );

  let prepared;
  try {
    prepared = await server.prepareTransaction(transaction);
  } catch (error) {
    throw new ContractSimulationError(error instanceof Error ? error.message : String(error));
  }
  prepared.sign(signerKeypair);

  const sendResponse = await server.sendTransaction(prepared);
  if (sendResponse.status !== "PENDING") {
    throw new ContractInvocationError(
      `The network didn't accept this transaction for processing (${sendResponse.status}).`,
    );
  }

  const finalStatus = await server.pollTransaction(sendResponse.hash, { attempts: 15 });

  if (finalStatus.status === rpc.Api.GetTransactionStatus.SUCCESS) {
    return {
      hash: sendResponse.hash,
      resultValue: finalStatus.returnValue ? scValToNative(finalStatus.returnValue) : undefined,
    };
  }

  throw new ContractInvocationError(
    finalStatus.status === rpc.Api.GetTransactionStatus.NOT_FOUND
      ? "Submitted, but confirmation timed out — check the explorer for the final status."
      : "The network rejected this invocation.",
  );
}

/** Reads a single contract storage entry directly, bypassing simulation/events entirely. */
export async function readContractStorage(
  network: StellarNetwork,
  contractId: string,
  key: ContractArgInput,
  durability: rpc.Durability = rpc.Durability.Persistent,
): Promise<ContractStorageEntry> {
  const server = getRpcServer(network);
  const scKey = buildScVal(key);

  const entry = await server.getContractData(contractId, scKey, durability);
  const contractDataEntry = entry.val.contractData();

  return {
    value: scValToNative(contractDataEntry.val()),
    liveUntilLedgerSeq: entry.liveUntilLedgerSeq,
    lastModifiedLedgerSeq: entry.lastModifiedLedgerSeq,
  };
}

export function describeContractError(error: unknown): string {
  if (
    error instanceof ContractNotFoundError ||
    error instanceof ContractSimulationError ||
    error instanceof ContractInvocationError
  ) {
    return error.message;
  }
  if (error instanceof Error) {
    // Horizon/RPC "not found" errors for storage reads are already clear on their own.
    return error.message;
  }
  return "Something went wrong talking to the contract.";
}
