"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AngleResult = {
  label: string;
  value: number;
  unit: string;
  lowerIsBetter?: boolean;
};

export type PoseCapture = {
  snapshot: string;
  primary: AngleResult;
  secondary?: AngleResult;
  movementId: string;
  movementLabel: string;
  capturedAt: string;
};

// Captures keyed by `${clientId}:${phase}:${movementId}`
// phase = "before" | "after"
type State = {
  captures: Record<string, PoseCapture>;
  setCapture: (clientId: string, phase: "before" | "after", capture: PoseCapture) => void;
  getCapture: (clientId: string, phase: "before" | "after", movementId: string) => PoseCapture | null;
  clearClient: (clientId: string) => void;
};

function key(clientId: string, phase: string, movementId: string) {
  return `${clientId}:${phase}:${movementId}`;
}

export const usePoseStore = create<State>()(
  persist(
    (set, get) => ({
      captures: {},
      setCapture: (clientId, phase, capture) =>
        set((s) => ({
          captures: {
            ...s.captures,
            [key(clientId, phase, capture.movementId)]: capture,
          },
        })),
      getCapture: (clientId, phase, movementId) =>
        get().captures[key(clientId, phase, movementId)] ?? null,
      clearClient: (clientId) =>
        set((s) => {
          const next = { ...s.captures };
          Object.keys(next).forEach((k) => {
            if (k.startsWith(`${clientId}:`)) delete next[k];
          });
          return { captures: next };
        }),
    }),
    {
      name: "tide-pose",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
