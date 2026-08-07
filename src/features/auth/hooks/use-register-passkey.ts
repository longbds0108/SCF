"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerPasskey } from "@/features/auth/services/passkey-service";

export function useRegisterPasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletPublicKey: string) => registerPasskey(walletPublicKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["passkey-session"] });
    },
  });
}
