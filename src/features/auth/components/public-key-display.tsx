"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { truncateMiddle } from "@/lib/utils";

interface PublicKeyDisplayProps {
  publicKey: string;
  truncate?: boolean;
}

export function PublicKeyDisplay({ publicKey, truncate = false }: PublicKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <p className="flex-1 break-all font-mono text-sm">
        {truncate ? truncateMiddle(publicKey) : publicKey}
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleCopy}
        aria-label="Copy public key"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
