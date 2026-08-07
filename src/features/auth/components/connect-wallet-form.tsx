"use client";

import { type FormEvent, useState } from "react";

import { useConnectWallet } from "@/features/auth/hooks/use-connect-wallet";
import { useWalletSession } from "@/features/auth/hooks/use-wallet-session";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConnectWalletForm() {
  const { publicKey } = useWalletSession();
  const connectWallet = useConnectWallet();
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    connectWallet.mutate(password);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect wallet</CardTitle>
        {publicKey && (
          <CardDescription className="break-all font-mono text-xs">{publicKey}</CardDescription>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="connect-password">Password</Label>
            <Input
              id="connect-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          {connectWallet.isError && (
            <Alert variant="destructive">
              <AlertDescription>{connectWallet.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={connectWallet.isPending || password.length === 0}
          >
            {connectWallet.isPending ? "Connecting…" : "Connect"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
