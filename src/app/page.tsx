"use client";

import {
  PasskeyLoginGate,
  PasskeySecurityCard,
  useWalletSession,
  WalletPanel,
} from "@/features/auth";
import { usePasskeySessionStatus } from "@/features/auth/hooks/use-passkey-session";
import { SendUsdcDialog, SendXlmDialog } from "@/features/send";
import {
  NativeBalanceCard,
  NetworkCard,
  SequenceCard,
  UsdcBalanceCard,
  WalletAddressCard,
} from "@/features/wallet";
import { TransactionHistoryCard } from "@/features/transactions";
import { TrustlinesCard } from "@/features/trustlines";
import { ContractExplorerCard } from "@/features/contracts";

export default function Home() {
  const { isConnected } = useWalletSession();
  const { data: passkeyStatus, isLoading: isPasskeyStatusLoading } = usePasskeySessionStatus();

  // A device-level gate in front of the whole app, independent of wallet unlock state — see
  // PasskeyLoginGate's doc comment for why this doesn't replace the password step.
  if (!isPasskeyStatusLoading && passkeyStatus?.hasCredential && !passkeyStatus.isAuthenticated) {
    return <PasskeyLoginGate />;
  }

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-semibold">Stellar Wallet</h1>
        <div className="w-full max-w-sm">
          <WalletPanel />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <SendXlmDialog />
          <SendUsdcDialog />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WalletAddressCard />
        <NetworkCard />
        <NativeBalanceCard />
        <UsdcBalanceCard />
        <SequenceCard />
        <TrustlinesCard />
        <TransactionHistoryCard />
        <ContractExplorerCard />
        <PasskeySecurityCard />
      </div>
    </main>
  );
}
