"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MScreen } from "./shell";
import { subscribeChannel } from "@/lib/realtime";
import { useBodyState, EMPTY_ZONES } from "@/lib/body-state";
import { useSession } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { BodyPartStatus } from "@/components/features/body-viewer";

const BodyViewer = dynamic(() => import("@/components/features/body-viewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 60%, rgba(212,244,90,0.1), #0a0d14 70%)",
      }}
    />
  ),
});

type Segment = {
  start: number;
  end: number;
  speaker: string;
  text: string;
  zones?: { id: string; status: BodyPartStatus }[];
  flagged?: boolean;
};

export function MOnboardingSession() {
  const router = useRouter();
  const clientId = useSession((s) => s.activeClientId) ?? process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "marcus-rivera";
  const phase = useSession((s) => s.phase);
  const zones = useBodyState((s) => s.zones[clientId] ?? EMPTY_ZONES);
  const mergeZones = useBodyState((s) => s.mergeZones);
  const [segments, setSegments] = useState<Segment[]>([]);

  useEffect(() => {
    const unsubNotes = subscribeChannel<{ segment: Segment }>(
      `onboarding:${clientId}:notes`,
      "segment_played",
      ({ segment }) => {
        if (!segment) return;
        setSegments((prev) => [...prev, segment]);
      }
    );
    const unsubBody = subscribeChannel<{ zones: { id: string; status: BodyPartStatus }[] }>(
      `body:${clientId}`,
      "zones_updated",
      ({ zones: incoming }) => {
        if (incoming?.length) mergeZones(clientId, incoming);
      }
    );
    return () => {
      unsubNotes();
      unsubBody();
    };
  }, [clientId, mergeZones]);

  useEffect(() => {
    if (phase === "live" || phase === "review") router.push("/client/session");
  }, [phase, router]);

  const latest = segments.at(-1);

  return (
    <MScreen pt={54}>
      <div style={{ padding: "16px 20px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--signal)",
              boxShadow: "0 0 10px var(--signal)",
              animation: "breathe 1.6s infinite",
            }}
          />
          <span className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>
            Maya is onboarding you
          </span>
        </div>

        <div
          style={{
            marginTop: 14,
            height: 280,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid var(--ink-3)",
            background: "var(--ink-1)",
          }}
        >
          <BodyViewer markedParts={zones} />
        </div>

        <div
          style={{
            marginTop: 14,
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            paddingBottom: 28,
          }}
        >
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
            live transcript
          </div>
          <AnimatePresence initial={false}>
            {segments.map((seg, i) => (
              <motion.div
                key={`${seg.start}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: seg.flagged ? "rgba(212,244,90,0.08)" : "var(--ink-2)",
                  border: seg.flagged ? "1px solid rgba(212,244,90,0.22)" : "1px solid var(--ink-3)",
                  alignSelf: seg.speaker === "maya" ? "flex-start" : "flex-end",
                  maxWidth: "86%",
                }}
              >
                <div
                  className="mono upper"
                  style={{ fontSize: 9, color: seg.speaker === "maya" ? "var(--fog-3)" : "var(--signal)" }}
                >
                  {seg.speaker === "maya" ? "Maya" : "You"}
                </div>
                <div style={{ fontSize: 14, color: "var(--fog-0)", lineHeight: 1.4, marginTop: 2 }}>{seg.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {segments.length === 0 && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "var(--ink-2)",
                border: "1px dashed var(--ink-3)",
                color: "var(--fog-3)",
                fontSize: 12,
              }}
            >
              Waiting for Maya to begin the conversation…
            </div>
          )}
          {latest && (
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", textAlign: "center", marginTop: 6 }}>
              body map updates live as zones are mentioned
            </div>
          )}
        </div>
      </div>
    </MScreen>
  );
}
