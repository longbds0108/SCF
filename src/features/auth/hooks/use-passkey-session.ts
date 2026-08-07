"use client";

import { useQuery } from "@tanstack/react-query";

import { getPasskeySessionStatus } from "@/features/auth/services/passkey-service";

export function usePasskeySessionStatus() {
  return useQuery({
    queryKey: ["passkey-session"],
    queryFn: getPasskeySessionStatus,
  });
}
