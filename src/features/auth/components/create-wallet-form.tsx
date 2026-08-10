"use client";

import { Eye, EyeOff } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useCompleteWalletSetup } from "@/features/auth/hooks/use-complete-wallet-setup";
import { useCreateWallet } from "@/features/auth/hooks/use-create-wallet";
import { useCreateWalletFromPhrase } from "@/features/auth/hooks/use-create-wallet-from-phrase";
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

type BackupMethod = "phrase" | "secret";

export function CreateWalletForm() {
  const createWallet = useCreateWallet();
  const createWalletFromPhrase = useCreateWalletFromPhrase();
  const completeSetup = useCompleteWalletSetup();

  const [method, setMethod] = useState<BackupMethod>("phrase");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  const activeMutation = method === "phrase" ? createWalletFromPhrase : createWallet;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) return;
    activeMutation.mutate(password);
  }

  if (createWalletFromPhrase.data) {
    const { publicKey, recoveryPhrase, keypair } = createWalletFromPhrase.data;
    const words = recoveryPhrase.split(" ");

    return (
      <Card>
        <CardHeader>
          <CardTitle>Save your recovery phrase</CardTitle>
          <CardDescription>
            This is the only time your recovery phrase is shown. Anyone with it has full control
            of this wallet — write it down somewhere offline, in order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Public key</Label>
            <p className="break-all font-mono text-sm">{publicKey}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Recovery phrase</Label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSecretRevealed((value) => !value)}
                aria-label={secretRevealed ? "Hide recovery phrase" : "Reveal recovery phrase"}
              >
                {secretRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {secretRevealed ? (
              <ol className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-input p-3 text-sm sm:grid-cols-3">
                {words.map((word, index) => (
                  <li key={index} className="font-mono">
                    <span className="text-muted-foreground">{index + 1}.</span> {word}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-md border border-input p-3 font-mono text-sm text-muted-foreground">
                {words.map(() => "•••••").join(" ")}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={backupConfirmed}
              onChange={(event) => setBackupConfirmed(event.target.checked)}
              className="h-4 w-4"
            />
            I&apos;ve saved my recovery phrase somewhere safe
          </label>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!backupConfirmed}
            onClick={() => completeSetup(keypair)}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (createWallet.data) {
    const { publicKey, secret, keypair } = createWallet.data;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Save your secret key</CardTitle>
          <CardDescription>
            This is the only time your secret key is shown. Anyone with it has full control of this
            wallet — write it down somewhere offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Public key</Label>
            <p className="break-all font-mono text-sm">{publicKey}</p>
          </div>
          <div className="space-y-1">
            <Label>Secret key</Label>
            <div className="flex items-center gap-2">
              <p className="flex-1 break-all font-mono text-sm">
                {secretRevealed ? secret : "•".repeat(56)}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSecretRevealed((value) => !value)}
                aria-label={secretRevealed ? "Hide secret key" : "Reveal secret key"}
              >
                {secretRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={backupConfirmed}
              onChange={(event) => setBackupConfirmed(event.target.checked)}
              className="h-4 w-4"
            />
            I&apos;ve saved my secret key somewhere safe
          </label>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!backupConfirmed}
            onClick={() => completeSetup(keypair)}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new wallet</CardTitle>
        <CardDescription>Choose a password to encrypt your wallet on this device.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Backup method</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={method === "phrase" ? "default" : "outline"}
                onClick={() => setMethod("phrase")}
              >
                Recovery phrase
              </Button>
              <Button
                type="button"
                size="sm"
                variant={method === "secret" ? "default" : "outline"}
                onClick={() => setMethod("secret")}
              >
                Secret key
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-password">Password</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-confirm-password">Confirm password</Label>
            <Input
              id="create-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {passwordTooShort && (
            <p className="text-sm text-destructive">Password must be at least 8 characters.</p>
          )}
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
            disabled={activeMutation.isPending || password.length < 8 || password !== confirmPassword}
          >
            {activeMutation.isPending ? "Creating…" : "Create wallet"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
