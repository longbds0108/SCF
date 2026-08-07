"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutPasskeySession } from "@/features/auth/services/passkey-service";

export function useLogoutPasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutPasskeySession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["passkey-session"] });
    },
  });
}
