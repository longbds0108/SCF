import { cn } from "@/lib/utils";

function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? `${value.toString()}n` : value;
}

/** JSON.stringify with BigInt support — Soroban i64/i128/u128 values decode to bigint. */
export function formatJsonValue(value: unknown): string {
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value, jsonReplacer, 2);
  } catch {
    return String(value);
  }
}

interface JsonValueProps {
  value: unknown;
  className?: string;
}

/** Generic pretty-printed value display — not specific to any one feature's data shape. */
export function JsonValue({ value, className }: JsonValueProps) {
  return (
    <pre className={cn("overflow-x-auto rounded-md bg-muted p-3 text-xs", className)}>
      {formatJsonValue(value)}
    </pre>
  );
}
