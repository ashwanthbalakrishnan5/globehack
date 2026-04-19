"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DeviceProtocol, PairedDevice } from "./mqtt";

type State = {
  device: PairedDevice | null;
  protocol: DeviceProtocol | null;
  setDevice: (d: PairedDevice) => void;
  setProtocol: (p: DeviceProtocol) => void;
  clear: () => void;
};

export const useDeviceStore = create<State>()(
  persist(
    (set) => ({
      device: null,
      protocol: null,
      setDevice: (device) => set({ device }),
      setProtocol: (protocol) => set({ protocol }),
      clear: () => set({ device: null, protocol: null }),
    }),
    {
      name: "tide-device",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
