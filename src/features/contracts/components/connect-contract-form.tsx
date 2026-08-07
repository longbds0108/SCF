"use client";

import { type FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contractIdSchema } from "@/features/contracts/types/contract";

interface ConnectContractFormProps {
  isSubmitting: boolean;
  submitError?: string | null;
  onConnect: (contractId: string) => void;
}

export function ConnectContractForm({
  isSubmitting,
  submitError,
  onConnect,
}: ConnectContractFormProps) {
  const [contractId, setContractId] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = contractIdSchema.safeParse(contractId);
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }

    setFieldError(undefined);
    onConnect(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor="contract-id" className="sr-only">
          Contract address
        </Label>
        <Input
          id="contract-id"
          placeholder="C... contract address"
          value={contractId}
          onChange={(event) => setContractId(event.target.value)}
          autoComplete="off"
          required
        />
        {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
        {submitError && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Connecting…" : "Connect"}
      </Button>
    </form>
  );
}
