"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { PainReporter } from "@/components/features/pain-reporter";
import { useBodyState, EMPTY_ZONES } from "@/lib/body-state";
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

type Stage = "analyzing" | "drafting" | "ready" | "playing";

interface Props {
  clientId: string;
  clientName: string;
  clientProfile: string | null;
}

const ANALYZE_MS = 2200;
const DRAFT_MS = 900;
const QUESTION_REVEAL_MS = 650;
const CONVERSATION_DELAY_MS = 1400;

// Seeded from the Health Connect payload: football contact + 7 runs in 14 days
// stress the left knee, running volume + desk hours stress lower back, and
// sleep trending down with long desk hours shows up as neck tension.
const HEALTH_CONNECT_PREFILL: Record<string, MarkedParts> = {
  "alina-zhou": {
    left_knee: "pain",
    lower_back: "pain",
    neck: "pain",
  },
};

export function WOnboarding({ clientId, clientName, clientProfile }: Props) {
  const zones = useBodyState((s) => s.zones[clientId] ?? EMPTY_ZONES);
  const setAll = useBodyState((s) => s.setAll);
  const mergeZones = useBodyState((s) => s.mergeZones);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState<Stage>("analyzing");
  const [revealedQuestions, setRevealedQuestions] = useState(0);
  const [, startTransition] = useTransition();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const zonesAppliedRef = useRef<Set<number>>(new Set());
  const eventsSentRef = useRef<Set<number>>(new Set());
  const transcriptRef = useRef<HTMLDivElement>(null);

  const questions = useMemo(
    () => questionsForClient(clientId, clientProfile).slice(0, 6),
    [clientId, clientProfile]
  );

  useEffect(() => {
    fetch("/demo-onboarding-transcript.json")
      .then((r) => r.json())
      .then((data) => setSegments((data.segments ?? []) as Segment[]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setAll(clientId, HEALTH_CONNECT_PREFILL[clientId] ?? {});
  }, [clientId, setAll]);

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
    setStage("playing");
    setVisibleCount(0);
    zonesAppliedRef.current = new Set();
    eventsSentRef.current = new Set();

    timers.current.forEach(clearTimeout);
    timers.current = [];

    const audio = audioRef.current;
    audio?.play().catch(() => {
      // Audio missing or autoplay blocked. Fall back to wall-clock timers.
      segments.forEach((seg, i) => {
        const t = setTimeout(() => {
          revealSegment(i);
        }, seg.start * 1000);
        timers.current.push(t);
      });
    });

    function revealSegment(i: number) {
      const seg = segments[i];
      if (!seg) return;
      startTransition(() => {
        setVisibleCount((c) => Math.max(c, i + 1));
        if (seg.zones?.length && !zonesAppliedRef.current.has(i)) {
          mergeZones(clientId, seg.zones);
          zonesAppliedRef.current.add(i);
        }
      });
      if (!eventsSentRef.current.has(i)) {
        eventsSentRef.current.add(i);
        fetch("/api/onboarding/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, segment: seg }),
        }).catch(console.error);
      }
      if (i === segments.length - 1) {
        setTimeout(() => setPlaying(false), 800);
      }
    }

    // Audio-driven reveal loop: fires whichever segments have been reached
    const tickAudio = setInterval(() => {
      const ct = audioRef.current?.currentTime;
      if (typeof ct !== "number" || Number.isNaN(ct)) return;
      segments.forEach((seg, i) => {
        if (seg.start <= ct) revealSegment(i);
      });
    }, 300);
    timers.current.push(tickAudio as unknown as ReturnType<typeof setTimeout>);
  }, [segments, playing, clientId, mergeZones]);

  // Scripted AI generation: analyze → draft → reveal questions → auto-start
  useEffect(() => {
    if (questions.length === 0) return;
    const locals: ReturnType<typeof setTimeout>[] = [];
    locals.push(setTimeout(() => setStage("drafting"), ANALYZE_MS));
    locals.push(
      setTimeout(() => {
        setStage("ready");
        questions.forEach((_, i) => {
          const t = setTimeout(() => {
            setRevealedQuestions((c) => Math.max(c, i + 1));
          }, i * QUESTION_REVEAL_MS);
          locals.push(t);
        });
      }, ANALYZE_MS + DRAFT_MS)
    );
    return () => locals.forEach(clearTimeout);
  }, [questions]);

  // Auto-fire conversation once all questions are revealed and audio is loaded
  useEffect(() => {
    if (stage !== "ready") return;
    if (revealedQuestions < questions.length) return;
    if (segments.length === 0) return;
    const t = setTimeout(() => firePlayback(), CONVERSATION_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage, revealedQuestions, questions.length, segments.length, firePlayback]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => {
        clearTimeout(t);
        clearInterval(t as unknown as NodeJS.Timeout);
      });
    },
    []
  );

  // Auto-scroll transcript to the newest segment, but only if the user hasn't
  // scrolled up to read earlier ones. 80px tolerance feels natural.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [visibleCount]);

  const handleZoneChange = useCallback(
    (parts: MarkedParts) => setAll(clientId, parts),
    [clientId, setAll]
  );

  const visibleSegments = segments.slice(0, visibleCount);
  const currentSpeaker = visibleSegments.at(-1)?.speaker ?? null;

  const headerLabel =
    stage === "analyzing"
      ? "Analyzing 14 days of health data"
      : stage === "drafting"
      ? "Drafting personalized questions"
      : stage === "ready"
      ? "Questions ready, starting conversation"
      : `Onboarding · ${clientName} · Bay 3`;

  return (
    <WShell pageName="today">
      <audio
        ref={audioRef}
        src="/demo-onboarding.mp3"
        preload="auto"
        style={{ display: "none" }}
      />
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
            background: stage === "playing" ? "var(--signal)" : "var(--signal-dim)",
            boxShadow: stage === "playing" ? "0 0 12px var(--signal)" : "0 0 8px var(--signal-dim)",
            animation: "breathe 1.4s infinite",
          }}
        />
        <span className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>
          {headerLabel}
        </span>
        <span
          title="Audio is recorded with the client's acknowledgment. Required in two-party consent jurisdictions."
          className="mono upper"
          style={{
            fontSize: 9,
            letterSpacing: 0.14,
            padding: "4px 8px",
            borderRadius: 6,
            background: "rgba(245,176,83,0.1)",
            color: "var(--spark, #f5b053)",
            border: "1px solid rgba(245,176,83,0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span aria-hidden>⚠</span>
          two-party consent · audio recorded with client ack
        </span>
        <span style={{ flex: 1 }} />
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
            opacity: stage === "playing" && visibleCount >= segments.length && segments.length > 0 ? 1 : 0.55,
            pointerEvents: stage === "playing" && visibleCount >= segments.length && segments.length > 0 ? "auto" : "none",
            transition: "opacity 0.3s",
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
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
              flex: "0 0 240px",
              borderTop: "1px solid var(--ink-3)",
              background: "var(--ink-1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 20px",
                borderBottom: "1px solid var(--ink-3)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
                live transcript · diarized
              </span>
              {playing && currentSpeaker && (
                <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                  · {currentSpeaker === "maya" ? "Maya" : clientName.split(" ")[0]} speaking…
                </span>
              )}
            </div>

            <div
              ref={transcriptRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
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
              {!playing && visibleSegments.length === 0 && stage === "playing" && (
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
                  Maya beginning the conversation…
                </div>
              )}
            </div>
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
            <div
              className="mono upper"
              style={{ fontSize: 9, color: "var(--fog-3)", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Sparkles size={10} color="var(--signal)" />
              tailored interview · live-generated
            </div>
            <div className="serif" style={{ fontSize: 20, color: "var(--fog-0)", marginTop: 6, letterSpacing: -0.01 }}>
              Built from <em style={{ color: "var(--signal)" }}>{clientProfile ?? "this client's health data"}</em>
            </div>
          </div>

          <GenerationStatus stage={stage} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence initial={false}>
              {questions.slice(0, revealedQuestions).map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
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
                </motion.div>
              ))}
            </AnimatePresence>
            {stage === "ready" && revealedQuestions < questions.length && (
              <DraftingPlaceholder />
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
                ? "none yet · will surface as Alina describes tension"
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

function GenerationStatus({ stage }: { stage: Stage }) {
  if (stage === "playing") return null;
  const label =
    stage === "analyzing"
      ? "Reading HRV, sleep, and activity history"
      : stage === "drafting"
      ? "Shaping questions around football, running, gym, and desk hours"
      : "Ready";
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(212,244,90,0.05)",
        border: "1px solid rgba(212,244,90,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {stage === "ready" ? (
        <Sparkles size={14} color="var(--signal)" />
      ) : (
        <Loader2 size={14} className="animate-spin" color="var(--signal)" />
      )}
      <div style={{ flex: 1 }}>
        <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>
          {stage === "ready" ? "draft complete" : stage === "drafting" ? "drafting" : "analyzing"}
        </div>
        <div style={{ fontSize: 12, color: "var(--fog-0)", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function DraftingPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "var(--ink-2)",
        border: "1px dashed var(--ink-3)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Loader2 size={12} className="animate-spin" color="var(--signal)" />
      <span className="mono" style={{ fontSize: 11, color: "var(--fog-3)" }}>
        drafting next question
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 10,
            marginLeft: 4,
            background: "var(--signal)",
            animation: "caret-blink 1s infinite",
            verticalAlign: "middle",
          }}
        />
      </span>
    </motion.div>
  );
}
