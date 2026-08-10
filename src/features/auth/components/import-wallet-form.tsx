"use client";

import { type FormEvent, useState } from "react";

import { useImportWallet } from "@/features/auth/hooks/use-import-wallet";
import { useImportWalletFromPhrase } from "@/features/auth/hooks/use-import-wallet-from-phrase";
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
import { Textarea } from "@/components/ui/textarea";

type ImportMethod = "secret" | "phrase";

export function ImportWalletForm() {
  const importWallet = useImportWallet();
  const importWalletFromPhrase = useImportWalletFromPhrase();

  const [method, setMethod] = useState<ImportMethod>("secret");
  const [secretKey, setSecretKey] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const activeMutation = method === "secret" ? importWallet : importWalletFromPhrase;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) return;

    if (method === "secret") {
      importWallet.mutate({ secretKey, password });
    } else {
      importWalletFromPhrase.mutate({ recoveryPhrase, password });
    }
  }

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const credentialMissing =
    method === "secret" ? secretKey.trim().length === 0 : recoveryPhrase.trim().length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import an existing wallet</CardTitle>
        <CardDescription>
          {method === "secret"
            ? "Paste your Stellar secret key. It's encrypted with the password below before it ever touches storage."
            : "Enter your 12 or 24-word recovery phrase (SEP-0005) — the same phrase from Lobstr, Freighter, or any compliant Stellar wallet."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={method === "secret" ? "default" : "outline"}
              onClick={() => setMethod("secret")}
            >
              Secret key
            </Button>
            <Button
              type="button"
              size="sm"
              variant={method === "phrase" ? "default" : "outline"}
              onClick={() => setMethod("phrase")}
            >
              Recovery phrase
            </Button>
          </div>

          {method === "secret" ? (
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
          ) : (
            <div className="space-y-1">
              <Label htmlFor="import-phrase">Recovery phrase</Label>
              <Textarea
                id="import-phrase"
                placeholder="word1 word2 word3 ..."
                value={recoveryPhrase}
                onChange={(event) => setRecoveryPhrase(event.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                rows={3}
                required
              />
            </div>
          )}

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
          {activeMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>{activeMutation.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={
              activeMutation.isPending ||
              credentialMissing ||
              password.length < 8 ||
              password !== confirmPassword
            }
          >
            {activeMutation.isPending ? "Importing…" : "Import wallet"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
