"use client";

import { rpc } from "@stellar/stellar-sdk";
import { useState } from "react";

import { useWalletSession, useWalletSigner } from "@/features/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectContractForm } from "@/features/contracts/components/connect-contract-form";
import { ContractArgsEditor } from "@/features/contracts/components/contract-args-editor";
import { ContractResponseCard } from "@/features/contracts/components/contract-response-card";
import { useConnectContract } from "@/features/contracts/hooks/use-connect-contract";
import { useInvokeContract } from "@/features/contracts/hooks/use-invoke-contract";
import { useReadContractStorage } from "@/features/contracts/hooks/use-read-contract-storage";
import { useSimulateContract } from "@/features/contracts/hooks/use-simulate-contract";
import { describeContractError } from "@/features/contracts/services/contract-service";
import {
  methodNameSchema,
  validateContractArgs,
  type ContractArgInput,
} from "@/features/contracts/types/contract";
import { useNetworkStore } from "@/stores/network-store";

export function ContractExplorerCard() {
  const network = useNetworkStore((state) => state.network);
  const { publicKey } = useWalletSession();
  const signer = useWalletSigner();

  const connectMutation = useConnectContract(network);
  const simulateMutation = useSimulateContract(network);
  const invokeMutation = useInvokeContract(network);
  const readStorageMutation = useReadContractStorage(network);

  const [method, setMethod] = useState("");
  const [methodError, setMethodError] = useState<string | undefined>();
  const [args, setArgs] = useState<ContractArgInput[]>([]);
  const [storageKey, setStorageKey] = useState<ContractArgInput[]>([{ type: "symbol", value: "" }]);
  const [durability, setDurability] = useState<rpc.Durability>(rpc.Durability.Persistent);

  const connection = connectMutation.data;

  function runWithValidatedCall(action: (method: string, args: ContractArgInput[]) => void) {
    const methodResult = methodNameSchema.safeParse(method);
    if (!methodResult.success) {
      setMethodError(methodResult.error.issues[0]?.message);
      return;
    }
    const argErrors = validateContractArgs(args);
    if (argErrors.some(Boolean)) return;

    setMethodError(undefined);
    action(methodResult.data, args);
  }

  function handleSimulate() {
    if (!publicKey || !connection) return;
    runWithValidatedCall((validMethod, validArgs) => {
      simulateMutation.mutate({
        sourcePublicKey: publicKey,
        contractId: connection.contractId,
        method: validMethod,
        args: validArgs,
      });
    });
  }

  function handleInvoke() {
    if (!signer || !connection) return;
    runWithValidatedCall((validMethod, validArgs) => {
      invokeMutation.mutate({
        keypair: signer,
        contractId: connection.contractId,
        method: validMethod,
        args: validArgs,
      });
    });
  }

  function handleReadStorage() {
    const key = storageKey[0];
    if (!connection || !key) return;
    readStorageMutation.mutate({
      contractId: connection.contractId,
      key,
      durability,
    });
  }

  const argErrors = validateContractArgs(args);

  return (
    <Card className="sm:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Soroban Contract Explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase text-muted-foreground">Connection</Label>
            {connection && <Badge variant="outline">Connected</Badge>}
          </div>
          <ConnectContractForm
            isSubmitting={connectMutation.isPending}
            submitError={
              connectMutation.isError ? describeContractError(connectMutation.error) : null
            }
            onConnect={(contractId) => connectMutation.mutate(contractId)}
          />
          {connection && (
            <p className="break-all font-mono text-xs text-muted-foreground">
              {connection.contractId} · ledger {connection.latestLedger}
            </p>
          )}
        </div>

        {connection && (
          <>
            <div className="space-y-3 border-t pt-4">
              <Label className="text-xs uppercase text-muted-foreground">Invoke</Label>
              <div className="space-y-1">
                <Label htmlFor="contract-method">Method name</Label>
                <Input
                  id="contract-method"
                  placeholder="e.g. balance"
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                  autoComplete="off"
                />
                {methodError && <p className="text-sm text-destructive">{methodError}</p>}
              </div>
              <ContractArgsEditor args={args} errors={argErrors} onChange={setArgs} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSimulate}
                  disabled={simulateMutation.isPending || !publicKey}
                >
                  {simulateMutation.isPending ? "Simulating…" : "Simulate"}
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleInvoke}
                  disabled={invokeMutation.isPending || !signer}
                >
                  {invokeMutation.isPending ? "Invoking…" : "Invoke"}
                </Button>
              </div>

              {simulateMutation.isIdle ? null : (
                <ContractResponseCard
                  title="Simulation result"
                  status={simulateMutation.isError ? "error" : "success"}
                  value={simulateMutation.data?.resultValue}
                  errorMessage={
                    simulateMutation.isError
                      ? describeContractError(simulateMutation.error)
                      : undefined
                  }
                />
              )}
              {invokeMutation.isIdle ? null : (
                <ContractResponseCard
                  title="Invoke result"
                  status={invokeMutation.isError ? "error" : "success"}
                  value={invokeMutation.data?.resultValue}
                  errorMessage={
                    invokeMutation.isError ? describeContractError(invokeMutation.error) : undefined
                  }
                  hash={invokeMutation.data?.hash}
                  network={network}
                />
              )}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-xs uppercase text-muted-foreground">Read storage</Label>
              <ContractArgsEditor
                args={storageKey}
                onChange={setStorageKey}
                label="Storage key"
                singleRow
              />
              <div className="flex items-center gap-2">
                <Select
                  value={durability}
                  onValueChange={(value) => setDurability(value as rpc.Durability)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={rpc.Durability.Persistent}>Persistent</SelectItem>
                    <SelectItem value={rpc.Durability.Temporary}>Temporary</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleReadStorage}
                  disabled={readStorageMutation.isPending}
                >
                  {readStorageMutation.isPending ? "Reading…" : "Read"}
                </Button>
              </div>

              {readStorageMutation.isIdle ? null : (
                <ContractResponseCard
                  title="Storage value"
                  status={readStorageMutation.isError ? "error" : "success"}
                  value={readStorageMutation.data?.value}
                  errorMessage={
                    readStorageMutation.isError
                      ? describeContractError(readStorageMutation.error)
                      : undefined
                  }
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
