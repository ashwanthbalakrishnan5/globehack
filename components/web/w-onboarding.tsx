"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PainReporter } from "@/components/features/pain-reporter";
import { useBodyState } from "@/lib/body-state";
import { questionsForClient } from "@/lib/onboarding-questions";
import { subscribeChannel } from "@/lib/realtime";
import type { MarkedParts, BodyPartStatus } from "@/components/features/body-viewer";
import { WShell } from "./shell";
import { PoseCapturePanel } from "@/components/features/pose-capture-panel";

type Segment = {
  start: number;
  end: number;
  speaker: string;
  text: string;
  note_type: string;
  flagged: boolean;
  zones: { id: string; status: BodyPartStatus }[];
};

interface Props {
  clientId: string;
  clientName: string;
  clientProfile: string | null;
}

export function WOnboarding({ clientId, clientName, clientProfile }: Props) {
  const zones = useBodyState((s) => s.zones[clientId] ?? {});
  const setAll = useBodyState((s) => s.setAll);
  const mergeZones = useBodyState((s) => s.mergeZones);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pending, startTransition] = useTransition();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const questions = useMemo(
    () => questionsForClient(clientId, clientProfile),
    [clientId, clientProfile]
  );

  // Preload transcript
  useEffect(() => {
    fetch("/demo-onboarding-transcript.json")
      .then((r) => r.json())
      .then((data) => setSegments((data.segments ?? []) as Segment[]))
      .catch(console.error);
  }, []);

  // Clear any per-client prior state on mount so the demo starts clean
  useEffect(() => {
    setAll(clientId, {});
  }, [clientId, setAll]);

  // Subscribe for any realtime zone updates from alternate sources
  useEffect(() => {
    const unsub = subscribeChannel<{ zones: { id: string; status: BodyPartStatus }[] }>(
      `body:${clientId}`,
      "zones_updated",
      ({ zones: incoming }) => {
        if (incoming?.length) mergeZones(clientId, incoming);
      }
    );
    return unsub;
  }, [clientId, mergeZones]);

  const firePlayback = useCallback(() => {
    if (segments.length === 0 || playing) return;
    setPlaying(true);
    setVisibleCount(0);

    timers.current.forEach(clearTimeout);
    timers.current = [];

    segments.forEach((seg, i) => {
      const t = setTimeout(() => {
        startTransition(() => {
          setVisibleCount((c) => Math.max(c, i + 1));
          if (seg.zones?.length) mergeZones(clientId, seg.zones);
        });
        fetch("/api/onboarding/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, segment: seg }),
        }).catch(console.error);
        if (i === segments.length - 1) {
          setTimeout(() => setPlaying(false), 800);
        }
      }, seg.start * 1000 * 0.6);
      timers.current.push(t);
    });
  }, [segments, playing, clientId, mergeZones]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const handleZoneChange = useCallback(
    (parts: MarkedParts) => setAll(clientId, parts),
    [clientId, setAll]
  );

  const visibleSegments = segments.slice(0, visibleCount);
  const currentSpeaker = visibleSegments.at(-1)?.speaker ?? null;

  return (
    <WShell pageName="today">
      <div
        style={{
          padding: "12px 28px",
          background: "linear-gradient(90deg, rgba(212,244,90,0.1), rgba(212,244,90,0.01))",
          borderBottom: "1px solid rgba(212,244,90,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: playing ? "var(--signal)" : "var(--fog-3)",
            boxShadow: playing ? "0 0 12px var(--signal)" : "none",
            animation: playing ? "breathe 1.4s infinite" : "none",
          }}
        />
        <span className="mono upper" style={{ fontSize: 10, color: playing ? "var(--signal)" : "var(--fog-2)" }}>
          Onboarding · {clientName} · Bay 3
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={firePlayback}
          disabled={playing || pending || segments.length === 0}
          style={{
            height: 30,
            padding: "0 14px",
            borderRadius: 8,
            background: playing ? "var(--ink-3)" : "var(--signal)",
            color: playing ? "var(--fog-3)" : "var(--signal-ink)",
            border: "none",
            fontSize: 12,
            fontFamily: "var(--sans)",
            fontWeight: 600,
            cursor: playing || pending ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {playing && <Loader2 size={12} className="animate-spin" />}
          {playing ? "listening…" : "▶ Play conversation"}
        </button>
        <div style={{ width: 1, height: 16, background: "var(--ink-3)" }} />
        <Link
          href={`/practitioner/session/${clientId}/live`}
          style={{
            fontSize: 12,
            color: "var(--signal-ink)",
            fontFamily: "var(--sans)",
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 8,
            background: "var(--signal)",
            border: "none",
            textDecoration: "none",
          }}
        >
          Start session →
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", minHeight: 0 }}>
          <PainReporter markedParts={zones} onChange={handleZoneChange} />

          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(10,13,20,0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(212,244,90,0.22)",
              width: 300,
            }}
          >
            <PoseCapturePanel clientId={clientId} phase="before" />
          </div>
        </div>

        <div
          style={{
            borderLeft: "1px solid var(--ink-3)",
            padding: "20px 20px",
            overflow: "auto",
            background: "var(--ink-1)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>interview script</div>
            <div className="serif" style={{ fontSize: 20, color: "var(--fog-0)", marginTop: 4, letterSpacing: -0.01 }}>
              Tailored to <em style={{ color: "var(--signal)" }}>{clientProfile ?? "this athlete"}</em>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {questions.slice(0, 6).map((q, i) => (
              <div
                key={q.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--ink-2)",
                  border: "1px solid var(--ink-3)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 2,
                    background: "var(--signal-dim)",
                    borderRadius: 999,
                  }}
                />
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>
                  {q.activity} · {i + 1}
                </div>
                <div style={{ fontSize: 13, color: "var(--fog-0)", marginTop: 4 }}>{q.prompt}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 4 }}>
                  {q.hint}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--ink-3)",
              paddingTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
              live transcript · diarized
            </div>
            <AnimatePresence initial={false}>
              {visibleSegments.map((seg, i) => (
                <motion.div
                  key={`${seg.start}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: seg.flagged ? "rgba(212,244,90,0.06)" : "var(--ink-2)",
                    border: seg.flagged ? "1px solid rgba(212,244,90,0.2)" : "1px solid var(--ink-3)",
                  }}
                >
                  <div
                    className="mono upper"
                    style={{
                      fontSize: 9,
                      color: seg.speaker === "maya" ? "var(--fog-3)" : "var(--signal)",
                    }}
                  >
                    {seg.speaker === "maya" ? "MAYA" : clientName.split(" ")[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fog-0)", marginTop: 2, lineHeight: 1.4 }}>
                    {seg.text}
                  </div>
                  {seg.zones?.length > 0 && (
                    <div className="mono" style={{ fontSize: 10, color: "var(--signal)", marginTop: 6 }}>
                      lighting · {seg.zones.map((z) => z.id.replace("_", " ")).join(", ")}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {playing && currentSpeaker && (
              <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                {currentSpeaker === "maya" ? "Maya" : clientName.split(" ")[0]} speaking…
              </div>
            )}
            {!playing && visibleSegments.length === 0 && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--ink-2)",
                  border: "1px dashed var(--ink-3)",
                  fontSize: 11,
                  color: "var(--fog-3)",
                }}
              >
                Press play to start the onboarding conversation.
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
            }}
          >
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
              zones flagged
            </div>
            <div style={{ fontSize: 12, color: "var(--fog-0)", marginTop: 4 }}>
              {Object.keys(zones).length === 0
                ? "none yet · press play or tap the body to mark"
                : Object.entries(zones)
                  .map(([id, status]) => `${id.replace("_", " ")} (${status})`)
                  .join(", ")}
            </div>
          </div>
        </div>
      </div>
    </WShell>
  );
}
