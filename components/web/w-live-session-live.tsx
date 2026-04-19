"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingButton, Meter, Tag, VoiceWave, WavePath } from "@/components/primitives";
import { WShell } from "./shell";
import { subscribeChannel } from "@/lib/realtime";
import { useBodyState } from "@/lib/body-state";
import type { SessionNote } from "@/lib/types";
import type { BodyPartStatus } from "@/components/features/body-viewer";
import { PoseCapturePanel } from "@/components/features/pose-capture-panel";
import { PoseComparison } from "@/components/features/pose-comparison";
import { usePoseStore } from "@/lib/pose-store";
import { MOVEMENTS } from "@/components/features/pose-capture";

const BodyViewer = dynamic(() => import("@/components/features/body-viewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 60%, rgba(212,244,90,0.08), #0a0d14 70%)",
      }}
    />
  ),
});

interface FallbackSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
  note_type: string;
  flagged: boolean;
}

interface Props {
  sessionId: string;
  clientId: string;
  initialNotes: SessionNote[];
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const NoteRow = memo(function NoteRow({ note }: { note: SessionNote }) {
  const n = note;
  return (
    <motion.div
      initial={{ opacity: 0, x: n.speaker === "maya" ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "10px 14px",
        background: n.flagged ? "rgba(212,244,90,0.06)" : "transparent",
        border: n.flagged ? "1px solid rgba(212,244,90,0.2)" : "1px solid transparent",
        borderRadius: 10,
      }}
    >
      <div style={{ width: 70, flexShrink: 0 }}>
        <div
          className="mono upper"
          style={{ fontSize: 9, color: n.speaker === "maya" ? "var(--fog-3)" : "var(--signal)" }}
        >
          {n.speaker === "maya" ? "MAYA" : "MARCUS"}
        </div>
        <div className="mono tnum" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
          {fmt(Math.round(n.start_sec ?? 0))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "var(--fog-0)", lineHeight: 1.4 }}>
          {n.quote ? (
            <>
              {n.text.split(n.quote)[0]}
              <span
                style={{
                  background: "rgba(212,244,90,0.22)",
                  color: "var(--signal)",
                  padding: "1px 3px",
                  borderRadius: 2,
                }}
              >
                {n.quote}
              </span>
              {n.text.split(n.quote)[1]}
            </>
          ) : (
            n.text
          )}
        </div>
        {n.flagged && (
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <Tag color="var(--signal)">{n.note_type}</Tag>
            <Tag color="var(--fog-3)">→ auto-note</Tag>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export function WLiveSessionLive({ sessionId, clientId, initialNotes }: Props) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [notes, setNotes] = useState<SessionNote[]>(initialNotes);
  const [useFallback, setUseFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [endingSession, setEndingSession] = useState(false);
  const fallbackSegs = useRef<FallbackSegment[]>([]);
  const receivedCount = useRef(0);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const zones = useBodyState((s) => s.zones[clientId] ?? {});
  const mergeZones = useBodyState((s) => s.mergeZones);
  const captures = usePoseStore((s) => s.captures);

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

  // Pre-load fallback transcript
  useEffect(() => {
    fetch("/demo-transcript.json")
      .then((r) => r.json())
      .then((data) => { fallbackSegs.current = data.segments ?? []; })
      .catch(() => { });
  }, []);

  // Subscribe to realtime notes
  useEffect(() => {
    const unsub = subscribeChannel<SessionNote>(
      `session:${sessionId}:notes`,
      "note_added",
      (note) => {
        receivedCount.current++;
        setNotes((prev) => [...prev, note]);
      }
    );
    return unsub;
  }, [sessionId]);

  // Elapsed clock
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Fallback replay driven by audio currentTime
  useEffect(() => {
    if (!useFallback || !isPlaying) return;
    const id = setInterval(() => {
      const ct = audioRef.current?.currentTime ?? 0;
      const visible = fallbackSegs.current.filter((s) => s.start <= ct);
      setNotes(
        visible.map((s, i) => ({
          id: `fb-${i}`,
          session_id: sessionId,
          speaker: s.speaker,
          text: s.text,
          note_type: s.note_type as SessionNote["note_type"],
          quote: null,
          rationale: null,
          flagged: s.flagged,
          start_sec: s.start,
          end_sec: s.end,
          created_at: new Date().toISOString(),
        }))
      );
    }, 600);
    return () => clearInterval(id);
  }, [useFallback, isPlaying, sessionId]);

  const bodyBeforeRef = useRef<Record<string, BodyPartStatus> | null>(null);

  const handleStart = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isPlaying || startingSession) return;
    bodyBeforeRef.current = { ...zones };
    setStartingSession(true);

    fallbackTimer.current = setTimeout(() => {
      if (receivedCount.current < 2) setUseFallback(true);
    }, 6000);

    fetch(`/api/session/${sessionId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl: `${window.location.origin}/demo-session.mp3` }),
    }).catch(console.error);

    try {
      await audio.play();
    } catch (e) {
      console.error(e);
    }
    setIsPlaying(true);
    setStartingSession(false);
  }, [sessionId, isPlaying, startingSession, zones]);

  const handleEndReview = useCallback(async () => {
    if (endingSession) return;
    setEndingSession(true);
    const bodyAfter: Record<string, BodyPartStatus> = {};
    for (const [id, status] of Object.entries(zones)) {
      bodyAfter[id] = status === "pain" ? "recovered" : status;
    }
    try {
      await fetch(`/api/session/${sessionId}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyBefore: bodyBeforeRef.current ?? zones,
          bodyAfter,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    router.push(`/practitioner/session/${clientId}/notes`);
  }, [sessionId, clientId, router, endingSession, zones]);

  const flagged = notes.filter((n) => n.flagged);

  return (
    <WShell pageName="live">
      <audio
        ref={audioRef}
        src="/demo-session.mp3"
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />

      {/* header bar */}
      <div
        style={{
          padding: "12px 28px",
          background: "rgba(212,244,90,0.04)",
          borderBottom: "1px solid var(--ink-3)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isPlaying ? "var(--signal)" : "var(--fog-3)",
            boxShadow: isPlaying ? "0 0 12px var(--signal)" : "none",
            animation: isPlaying ? "breathe 1.4s infinite" : "none",
          }}
        />
        <span className="mono upper" style={{ fontSize: 10, color: isPlaying ? "var(--signal)" : "var(--fog-3)" }}>
          {isPlaying ? "Live" : "Ready"} · Marcus Rivera · Bay 3
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono tnum" style={{ fontSize: 14, color: "var(--fog-0)" }}>
          {fmt(elapsed)} <span style={{ color: "var(--fog-3)", fontSize: 11 }}>/ 90:00</span>
        </span>
        <div style={{ width: 1, height: 16, background: "var(--ink-3)" }} />
        {!isPlaying ? (
          <LoadingButton
            onClick={handleStart}
            pending={startingSession}
            pendingLabel="Connecting to ElevenLabs…"
            style={{
              fontSize: 12,
              color: "var(--signal-ink)",
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 8,
              background: "var(--signal)",
              border: "none",
            }}
          >
            ▶ Start session
          </LoadingButton>
        ) : (
          <span className="mono" style={{ fontSize: 10, color: "var(--fog-2)" }}>
            listening
          </span>
        )}
        <div style={{ width: 1, height: 16, background: "var(--ink-3)" }} />
        <Link
          href={`/practitioner/session/${clientId}/resonance`}
          className="mono upper"
          style={{
            fontSize: 10,
            color: "var(--fog-2)",
            textDecoration: "none",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--ink-3)",
            letterSpacing: 0.12,
          }}
        >
          resonance map →
        </Link>
        <LoadingButton
          onClick={handleEndReview}
          pending={endingSession}
          pendingLabel="Saving…"
          style={{
            fontSize: 12,
            color: "var(--signal-ink)",
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 8,
            background: endingSession ? "var(--ink-3)" : "var(--signal)",
            border: "none",
          }}
        >
          End &amp; review
        </LoadingButton>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
        {/* Transcript column */}
        <div style={{ padding: "20px 28px", overflow: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 4 }}>
            ambient transcript · on-device diarization
            {useFallback && (
              <span style={{ color: "var(--spark)", marginLeft: 8 }}>· demo playback</span>
            )}
          </div>

          <AnimatePresence initial={false}>
            {notes.map((n, i) => (
              <NoteRow key={n.id ?? i} note={n} />
            ))}
          </AnimatePresence>

          {isPlaying && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px" }}>
              <div style={{ width: 70 }}>
                <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>listening</div>
              </div>
              <VoiceWave color="var(--signal)" bars={16} />
              <div
                style={{
                  width: 2,
                  height: 14,
                  background: "var(--signal)",
                  animation: "caret-blink 1s infinite",
                }}
              />
            </div>
          )}
        </div>

        {/* Right rail */}
        <div
          style={{
            borderLeft: "1px solid var(--ink-3)",
            padding: "20px 20px",
            overflow: "auto",
            background: "var(--ink-1)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            live body state
          </div>
          <div
            style={{
              height: 220,
              borderRadius: 12,
              border: "1px solid var(--ink-3)",
              background: "var(--ink-1)",
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            <BodyViewer markedParts={zones} />
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(10,13,20,0.88)",
              border: "1px solid rgba(212,244,90,0.22)",
              marginBottom: 12,
            }}
          >
            {/* Show comparison for any movement that has both before + after */}
            {MOVEMENTS.map((m) => {
              const before = captures[`${clientId}:before:${m.id}`];
              const after = captures[`${clientId}:after:${m.id}`];
              if (!before || !after) return null;
              return <PoseComparison key={m.id} before={before} after={after} />;
            })}
            <PoseCapturePanel clientId={clientId} phase="after" />
          </div>

          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            live vitals
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              marginBottom: 12,
            }}
          >
            <WavePath width={280} height={40} color="var(--hr)" amp={0.7} freq={4} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <div>
                <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)" }}>74</div>
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>hr live</div>
              </div>
              <div>
                <div className="mono tnum" style={{ fontSize: 22, color: "var(--signal)" }}>↓10</div>
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>drop</div>
              </div>
            </div>
          </div>

          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", margin: "16px 0 10px" }}>
            protocol · live
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--fog-0)", fontWeight: 500 }}>
              Parasympathetic · cooling
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 4 }}>
              40Hz · −4° · 90s · L4–L5
            </div>
            <div style={{ height: 1, background: "var(--ink-3)", margin: "12px -14px" }} />
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>elapsed</div>
            <Meter pct={Math.min(100, Math.round((elapsed / 90) * 100))} color="var(--signal)" />
          </div>

          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", margin: "16px 0 10px" }}>
            auto-notes this session
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <AnimatePresence initial={false}>
              {flagged.map((n, i) => (
                <motion.div
                  key={n.id ?? `fn-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  style={{
                    padding: "8px 10px",
                    background: "var(--ink-2)",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "var(--fog-2)",
                    border: "1px solid var(--ink-3)",
                  }}
                >
                  · {n.note_type} — {n.quote ?? n.text.slice(0, 48)}
                </motion.div>
              ))}
            </AnimatePresence>
            {flagged.length === 0 && (
              <div
                style={{
                  padding: "8px 10px",
                  background: "var(--ink-2)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "var(--fog-3)",
                  border: "1px solid var(--ink-3)",
                }}
              >
                · waiting for session to start
              </div>
            )}
          </div>
        </div>
      </div>
    </WShell>
  );
}
