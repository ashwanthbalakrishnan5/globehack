"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MarkedParts, BodyPartStatus } from "@/components/features/body-viewer";

type State = {
  zones: Record<string, MarkedParts>;
  setAll: (clientId: string, marked: MarkedParts) => void;
  setZone: (clientId: string, partId: string, status: BodyPartStatus | null) => void;
  mergeZones: (clientId: string, zones: Array<{ id: string; status: BodyPartStatus }>) => void;
  clear: (clientId: string) => void;
};

export const EMPTY_ZONES: MarkedParts = Object.freeze({}) as MarkedParts;

export const useBodyState = create<State>()(
  persist(
    (set) => ({
      zones: {},
      setAll: (clientId, marked) =>
        set((s) => ({ zones: { ...s.zones, [clientId]: marked } })),
      setZone: (clientId, partId, status) =>
        set((s) => {
          const current = { ...(s.zones[clientId] ?? {}) };
          if (status === null) delete current[partId];
          else current[partId] = status;
          return { zones: { ...s.zones, [clientId]: current } };
        }),
      mergeZones: (clientId, incoming) =>
        set((s) => {
          const current = { ...(s.zones[clientId] ?? {}) };
          for (const { id, status } of incoming) current[id] = status;
          return { zones: { ...s.zones, [clientId]: current } };
        }),
      clear: (clientId) =>
        set((s) => {
          const next = { ...s.zones };
          delete next[clientId];
          return { zones: next };
        }),
    }),
    {
      name: "tide-body-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
