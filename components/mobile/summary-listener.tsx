"use client";

import { useEffect, useState } from "react";
import { subscribeChannel } from "@/lib/realtime";
import { useSession } from "@/lib/store";
import { MSummarySheet } from "./m-summary-sheet";
import type { SummaryCard } from "@/lib/types";

export function SummaryListener({ clientId }: { clientId: string }) {
  const fireSummary = useSession((s) => s.fireSummary);
  const [card, setCard] = useState<SummaryCard | null>(null);

  useEffect(() => {
    const unsub = subscribeChannel<{ sessionId: string; card: SummaryCard }>(
      `summary:${clientId}`,
      "summary_ready",
      ({ card }) => {
        fireSummary();
        setCard(card);
      }
    );
    return unsub;
  }, [clientId, fireSummary]);

  return <MSummarySheet card={card} onClose={() => setCard(null)} />;
}
