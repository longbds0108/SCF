import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "GCSG…732X" — used for any Stellar address (account, contract, issuer) shown inline. */
export function truncateMiddle(value: string, headLength = 4, tailLength = 4): string {
  if (value.length <= headLength + tailLength) return value;
  return `${value.slice(0, headLength)}…${value.slice(-tailLength)}`;
}
