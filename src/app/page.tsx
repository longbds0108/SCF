"use client";

import Image from "next/image";

import { PasskeyLoginGate, PasskeySecurityCard, useWalletSession } from "@/features/auth";
import { usePasskeySessionStatus } from "@/features/auth/hooks/use-passkey-session";
import { LandingPage } from "@/features/landing";
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
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen">
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/coastal-cliffs.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-background" />
        </div>
        <div className="mx-auto flex h-full max-w-4xl items-end justify-between px-8 pb-6">
          <h1 className="text-2xl font-semibold text-white drop-shadow-md">Dashboard</h1>
          <div className="flex gap-2">
            <SendXlmDialog />
            <SendUsdcDialog />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-8 pb-8">
        <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </main>
  );
}
