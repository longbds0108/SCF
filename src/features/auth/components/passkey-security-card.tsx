"use client";

import { Fingerprint } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginWithPasskey } from "@/features/auth/hooks/use-login-with-passkey";
import { useLogoutPasskey } from "@/features/auth/hooks/use-logout-passkey";
import { usePasskeySessionStatus } from "@/features/auth/hooks/use-passkey-session";
import { useRegisterPasskey } from "@/features/auth/hooks/use-register-passkey";
import { useWalletSession } from "@/features/auth/hooks/use-wallet-session";
import {
  browserSupportsWebAuthn,
  describePasskeyError,
} from "@/features/auth/services/passkey-service";

export function PasskeySecurityCard() {
  const { publicKey } = useWalletSession();
  const { data: status, isLoading } = usePasskeySessionStatus();
  const registerMutation = useRegisterPasskey();
  const loginMutation = useLoginWithPasskey();
  const logoutMutation = useLogoutPasskey();

  if (!browserSupportsWebAuthn()) {
    return (
      <Card className="sm:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Passkey Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This browser doesn&apos;t support passkeys (WebAuthn). The wallet works normally without
            one — passkey login is an optional extra layer, not a requirement.
          </p>
        </CardContent>
      </Card>
    );
  }

  function handleRegister() {
    if (!publicKey) return;
    registerMutation.mutate(publicKey, {
      onSuccess: () => toast.success("Passkey registered — this device is now protected."),
    });
  }

  function handleVerify() {
    loginMutation.mutate(undefined, {
      onSuccess: () => toast.success("Passkey verified."),
    });
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => toast.success("Logged out of the passkey session."),
    });
  }

  return (
    <Card className="sm:col-span-2 lg:col-span-3">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Passkey Security</CardTitle>
        {!isLoading && status?.hasCredential && (
          <Badge variant="outline">{status.isAuthenticated ? "Verified" : "Registered"}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {status?.hasCredential ? (
          <>
            <p className="text-sm text-muted-foreground">
              A passkey is registered for this device. Future visits will ask for it before your
              wallet is reachable.
            </p>
            {(registerMutation.isError || loginMutation.isError || logoutMutation.isError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {describePasskeyError(
                    logoutMutation.error ?? loginMutation.error ?? registerMutation.error,
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              {!status.isAuthenticated && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerify}
                  disabled={loginMutation.isPending}
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  {loginMutation.isPending ? "Verifying…" : "Verify now"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending || !status.isAuthenticated}
              >
                {logoutMutation.isPending ? "Logging out…" : "Log out of passkey session"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Add a passkey (Face ID, Touch ID, Windows Hello, or a security key) to require it on
              future visits before this wallet is reachable — an extra layer beyond your password.
            </p>
            {registerMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>{describePasskeyError(registerMutation.error)}</AlertDescription>
              </Alert>
            )}
            <Button
              type="button"
              onClick={handleRegister}
              disabled={registerMutation.isPending || !publicKey}
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              {registerMutation.isPending ? "Registering…" : "Register a passkey"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
