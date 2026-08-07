"use client";

import { Fingerprint } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginWithPasskey } from "@/features/auth/hooks/use-login-with-passkey";
import { describePasskeyError } from "@/features/auth/services/passkey-service";

/**
 * Shown instead of the wallet UI whenever a passkey is registered on this device but the
 * current browser session hasn't passed WebAuthn yet — a device-level gate in front of the
 * wallet's own password-protected unlock, not a replacement for it.
 */
export function PasskeyLoginGate() {
  const loginMutation = useLoginWithPasskey();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Fingerprint className="mb-2 h-10 w-10 text-muted-foreground" />
          <CardTitle>Unlock with Passkey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            This device has a passkey registered. Verify it&apos;s you before continuing to your
            wallet.
          </p>
          {loginMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>{describePasskeyError(loginMutation.error)}</AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            className="w-full"
            onClick={() => loginMutation.mutate()}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Waiting for passkey…" : "Log in with Passkey"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
