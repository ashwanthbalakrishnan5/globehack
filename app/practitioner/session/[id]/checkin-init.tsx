"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/store";

export function CheckinInit({ clientId }: { clientId: string }) {
  const startCheckIn = useSession((s) => s.startCheckIn);
  useEffect(() => {
    startCheckIn(clientId, `session-${Date.now()}`, "simulated");
  }, [clientId, startCheckIn]);
  return null;
}
