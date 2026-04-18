"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Cross-device-ish session state, persisted to localStorage.
 *
 * Real production uses Insforge realtime channels for the check-in and
 * summary-ready signals. For this demo, the practitioner and client share
 * the same origin, so localStorage events cross tabs on the same machine.
 * When running the phone and laptop demo together on one device, this is
 * enough to prove the loop.
 */
type SessionPhase =
  | "idle"
  | "checked-in"
  | "recommending"
  | "live"
  | "review"
  | "summary-ready";

type State = {
  activeSessionId: string | null;
  activeClientId: string | null;
  phase: SessionPhase;
  summaryReady: boolean;
  startCheckIn: (clientId: string, sessionId: string) => void;
  startLive: () => void;
  endLive: () => void;
  fireSummary: () => void;
  resetDemo: () => void;
};

export const useSession = create<State>()(
  persist(
    (set) => ({
      activeSessionId: null,
      activeClientId: null,
      phase: "idle",
      summaryReady: false,
      startCheckIn: (clientId, sessionId) =>
        set({
          activeClientId: clientId,
          activeSessionId: sessionId,
          phase: "checked-in",
          summaryReady: false,
        }),
      startLive: () => set({ phase: "live" }),
      endLive: () => set({ phase: "review" }),
      fireSummary: () => set({ phase: "summary-ready", summaryReady: true }),
      resetDemo: () =>
        set({
          activeSessionId: null,
          activeClientId: null,
          phase: "idle",
          summaryReady: false,
        }),
    }),
    {
      name: "tide-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
