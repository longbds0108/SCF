"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loginWithPasskey } from "@/features/auth/services/passkey-service";

export function useLoginWithPasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithPasskey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["passkey-session"] });
    },
  });
}
