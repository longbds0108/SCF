"use client";

import { type FormEvent, useState } from "react";

import { useImportWallet } from "@/features/auth/hooks/use-import-wallet";
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

export function ImportWalletForm() {
  const importWallet = useImportWallet();

  const [secretKey, setSecretKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) return;
    importWallet.mutate({ secretKey, password });
  }

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import an existing wallet</CardTitle>
        <CardDescription>
          Paste your Stellar secret key. It&apos;s encrypted with the password below before it ever
          touches storage.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="import-secret">Secret key</Label>
            <Input
              id="import-secret"
              type="password"
              placeholder="S..."
              value={secretKey}
              onChange={(event) => setSecretKey(event.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="import-password">Password</Label>
            <Input
              id="import-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="import-confirm-password">Confirm password</Label>
            <Input
              id="import-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {passwordsMismatch && (
            <p className="text-sm text-destructive">Passwords don&apos;t match.</p>
          )}
          {importWallet.isError && (
            <Alert variant="destructive">
              <AlertDescription>{importWallet.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={
              importWallet.isPending ||
              secretKey.trim().length === 0 ||
              password.length < 8 ||
              password !== confirmPassword
            }
          >
            {importWallet.isPending ? "Importing…" : "Import wallet"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
