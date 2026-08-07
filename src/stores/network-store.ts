import { create } from "zustand";

import { DEFAULT_NETWORK } from "@/lib/config";
import type { StellarNetwork } from "@/lib/network";

interface NetworkState {
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  network: DEFAULT_NETWORK,
  setNetwork: (network) => set({ network }),
}));
