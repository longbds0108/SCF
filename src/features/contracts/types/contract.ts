import { z } from "zod";

import { isValidContractId } from "@/lib/stellar";

/** Argument/storage-key types this UI can build ScVals for — the common scalar cases. */
export const SC_VAL_TYPES = [
  "string",
  "symbol",
  "bool",
  "u32",
  "i32",
  "u64",
  "i64",
  "u128",
  "i128",
  "address",
  "bytes",
] as const;

export type ScValArgType = (typeof SC_VAL_TYPES)[number];

export interface ContractArgInput {
  type: ScValArgType;
  value: string;
}

export const contractIdSchema = z
  .string()
  .trim()
  .min(1, "Enter a contract address.")
  .refine(isValidContractId, { message: "Enter a valid contract address (starts with C)." });

export const methodNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a method name.")
  .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Method names are letters, numbers, and underscores.");

function validateArgValue(arg: ContractArgInput): string | undefined {
  const value = arg.value.trim();
  if (value.length === 0) return "Enter a value.";

  switch (arg.type) {
    case "bool":
      return value === "true" || value === "false" ? undefined : 'Enter "true" or "false".';
    case "u32":
    case "i32":
      return Number.isInteger(Number(value)) ? undefined : "Enter a whole number.";
    case "u64":
    case "i64":
    case "u128":
    case "i128":
      try {
        BigInt(value);
        return undefined;
      } catch {
        return "Enter a whole number.";
      }
    case "address":
      return /^[GC][A-Z2-7]{55}$/.test(value)
        ? undefined
        : "Enter a valid account (G...) or contract (C...) address.";
    case "bytes":
      return /^[0-9a-fA-F]*$/.test(value) && value.length % 2 === 0
        ? undefined
        : "Enter hex-encoded bytes (even number of hex digits).";
    default:
      return undefined;
  }
}

export function validateContractArgs(args: ContractArgInput[]): (string | undefined)[] {
  return args.map(validateArgValue);
}
