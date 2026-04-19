"use client";

import { memo, useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, Play, Square } from "lucide-react";
import { LoadingButton, Meter, Tag, VoiceWave, WavePath } from "@/components/primitives";
import { WShell } from "./shell";
import { subscribeChannel } from "@/lib/realtime";
import { useBodyState, EMPTY_ZONES } from "@/lib/body-state";
import type { SessionNote } from "@/lib/types";
import type { BodyPartStatus } from "@/components/features/body-viewer";
import { PoseCapturePanel } from "@/components/features/pose-capture-panel";
import { PoseComparison } from "@/components/features/pose-comparison";
import { usePoseStore } from "@/lib/pose-store";
import { MOVEMENTS } from "@/components/features/pose-capture";
import { useDeviceStore } from "@/lib/device-store";

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

type Phase = "ready" | "beltPrep" | "starting" | "live" | "ending";

const BELT_PREP_AUTO_MS = 9000;
const AUDIO_LEAD_IN_MS = 2800;

const audioCtrlStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 6,
  background: "var(--ink-2)",
  border: "1px solid var(--ink-3)",
  color: "var(--fog-0)",
  cursor: "pointer",
  fontFamily: "var(--sans)",
};

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
          {n.speaker === "maya" ? "MAYA" : "ALINA"}
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
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [beltCountdown, setBeltCountdown] = useState(Math.ceil(BELT_PREP_AUTO_MS / 1000));
  const [mqttAck, setMqttAck] = useState<string | null>(null);
  const [showRomGate, setShowRomGate] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const fallbackSegs = useRef<FallbackSegment[]>([]);
  const receivedCount = useRef(0);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const zones = useBodyState((s) => s.zones[clientId] ?? EMPTY_ZONES);
  const mergeZones = useBodyState((s) => s.mergeZones);
  const captures = usePoseStore((s) => s.captures);
  const clearPoses = usePoseStore((s) => s.clearClient);
  const device = useDeviceStore((s) => s.device);
  const protocol = useDeviceStore((s) => s.protocol);

  const isPlaying = phase === "live";

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

  useEffect(() => {
    fetch("/demo-transcript.json")
      .then((r) => r.json())
      .then((data) => { fallbackSegs.current = data.segments ?? []; })
      .catch(() => { });
  }, []);

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

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

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

  useEffect(
    () => () => {
      phaseTimers.current.forEach(clearTimeout);
    },
    []
  );

  const handleStart = useCallback(() => {
    if (phase !== "ready") return;
    bodyBeforeRef.current = { ...zones };
    setPhase("beltPrep");
    setBeltCountdown(Math.ceil(BELT_PREP_AUTO_MS / 1000));

    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];

    const tick = setInterval(() => {
      setBeltCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    phaseTimers.current.push(tick as unknown as ReturnType<typeof setTimeout>);

    const advance = setTimeout(() => {
      clearInterval(tick);
      beginSession();
    }, BELT_PREP_AUTO_MS);
    phaseTimers.current.push(advance);
  }, [phase, zones]);

  const beginSession = useCallback(async () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    setPhase("starting");

    // Fire MQTT start using paired device + selected protocol
    const mac = device?.mac ?? "74:4D:BD:A0:A3:EC";
    if (protocol) {
      try {
        await fetch("/api/device/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mac, protocol }),
        });
        setMqttAck(`mqtt · ${protocol.name} · ${mac.slice(-5)}`);
      } catch (e) {
        console.warn("mqtt start failed", e);
        setMqttAck("mqtt · fallback mode");
      }
    } else {
      setMqttAck("mqtt · no protocol selected");
    }

    // Record session start in backend
    fetch(`/api/session/${sessionId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl: `${window.location.origin}/demo-session.mp3` }),
    }).catch(console.error);

    fallbackTimer.current = setTimeout(() => {
      if (receivedCount.current < 2) setUseFallback(true);
    }, 6000);

    // Lead-in before audio so the belt-on moment reads clean
    const audioLeadIn = setTimeout(async () => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        await audio.play();
      } catch (e) {
        console.error(e);
      }
      setPhase("live");
    }, AUDIO_LEAD_IN_MS);
    phaseTimers.current.push(audioLeadIn);
  }, [sessionId]);

  const handleSkipBelt = useCallback(() => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    beginSession();
  }, [beginSession]);

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(console.error);
      setPaused(false);
    } else {
      audio.pause();
      setPaused(true);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPaused(false);
  }, []);

  // Derived — must be above callbacks that reference them
  const aftersDone = MOVEMENTS.filter((m) => !!captures[`${clientId}:after:${m.id}`]);
  const allAftersDone = aftersDone.length === MOVEMENTS.length;
  const sessionStarted = phase === "live" || phase === "ending";

  const handleEndReview = useCallback(async () => {
    if (phase === "ending") return;
    // Gate: require all after-captures before ending
    if (!allAftersDone) {
      setShowRomGate(true);
      return;
    }
    setShowImprovements(true);
  }, [phase, allAftersDone]);

  const handleConfirmEnd = useCallback(async () => {
    setShowImprovements(false);
    setPhase("ending");
    try {
      await fetch("/api/device/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac: device?.mac ?? "74:4D:BD:A0:A3:EC" }),
      });
    } catch (e) {
      console.warn("mqtt stop failed", e);
    }
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
    clearPoses(clientId);
    router.push(`/practitioner/session/${clientId}/notes`);
  }, [sessionId, clientId, router, zones, device, clearPoses]);

  const flagged = notes.filter((n) => n.flagged);
  const showBeltOverlay = phase === "beltPrep" || phase === "starting";

  const statusLabel =
    phase === "live"
      ? "Live"
      : phase === "beltPrep"
        ? "Belt prep"
        : phase === "starting"
          ? "Syncing device"
          : phase === "ending"
            ? "Ending"
            : "Ready";

  return (
    <WShell pageName="live">
      <audio
        ref={audioRef}
        src="/demo-session.mp3"
        onEnded={() => setPhase((p) => (p === "live" ? "live" : p))}
        style={{ display: "none" }}
      />

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
            animation: isPlaying || showBeltOverlay ? "breathe 1.4s infinite" : "none",
          }}
        />
        <span className="mono upper" style={{ fontSize: 10, color: isPlaying ? "var(--signal)" : "var(--fog-3)" }}>
          {statusLabel} · Alina Zhou · Bay 3
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
        {isPlaying && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={togglePause}
              title={paused ? "Resume audio" : "Pause audio"}
              style={audioCtrlStyle}
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              <span className="mono upper" style={{ fontSize: 9, letterSpacing: 0.12 }}>
                {paused ? "resume" : "pause"}
              </span>
            </button>
            <button
              onClick={stopPlayback}
              title="Stop audio and move on"
              style={audioCtrlStyle}
            >
              <Square size={11} />
              <span className="mono upper" style={{ fontSize: 9, letterSpacing: 0.12 }}>
                stop
              </span>
            </button>
          </div>
        )}
        <span style={{ flex: 1 }} />
        <span className="mono tnum" style={{ fontSize: 14, color: "var(--fog-0)" }}>
          {fmt(elapsed)} <span style={{ color: "var(--fog-3)", fontSize: 11 }}>/ 90:00</span>
        </span>
        <div style={{ width: 1, height: 16, background: "var(--ink-3)" }} />
        {phase === "ready" ? (
          <LoadingButton
            onClick={handleStart}
            pending={false}
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
        ) : isPlaying ? (
          <span className="mono" style={{ fontSize: 10, color: "var(--fog-2)" }}>
            listening · {mqttAck ?? "audio streaming"}
          </span>
        ) : (
          <span className="mono" style={{ fontSize: 10, color: "var(--fog-2)" }}>
            {phase === "starting" ? "device syncing" : "awaiting belt"}
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
          pending={phase === "ending"}
          pendingLabel="Saving…"
          disabled={phase === "ready"}
          style={{
            fontSize: 12,
            color: "var(--signal-ink)",
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 8,
            background: phase === "ending" ? "var(--ink-3)" : "var(--signal)",
            border: "none",
          }}
        >
          {sessionStarted && !allAftersDone
            ? `End & review · ${MOVEMENTS.length - aftersDone.length} ROM pending`
            : "End & review"}
        </LoadingButton>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden", position: "relative" }}>
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

        <AnimatePresence>
          {showBeltOverlay && (
            <BeltStrapOverlay
              phase={phase}
              countdown={beltCountdown}
              onSkip={handleSkipBelt}
              mqttAck={mqttAck}
            />
          )}
        </AnimatePresence>

        {/* ROM gate — blocks end until after-captures done */}
        <AnimatePresence>
          {showRomGate && (
            <RomGateOverlay
              clientId={clientId}
              captures={captures}
              onDone={() => { setShowRomGate(false); setShowImprovements(true); }}
              onDismiss={() => setShowRomGate(false)}
            />
          )}
        </AnimatePresence>

        {/* Improvement summary — shown before navigating away */}
        <AnimatePresence>
          {showImprovements && (
            <ImprovementSummaryOverlay
              clientId={clientId}
              captures={captures}
              onConfirm={handleConfirmEnd}
            />
          )}
        </AnimatePresence>
      </div>
    </WShell>
  );
}

function BeltStrapOverlay({
  phase,
  countdown,
  onSkip,
  mqttAck,
}: {
  phase: Phase;
  countdown: number;
  onSkip: () => void;
  mqttAck: string | null;
}) {
  const isStarting = phase === "starting";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "rgba(6,8,12,0.94)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "center",
          maxWidth: 900,
          padding: "40px 56px",
        }}
      >
        <div
          style={{
            width: 280,
            height: 380,
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            background: "radial-gradient(circle at 50% 50%, rgba(212,244,90,0.12), transparent 70%)",
            border: "1px solid rgba(212,244,90,0.2)",
          }}
        >
          <BodyViewer markedParts={{ lower_back: "active", abdomen: "active" }} />
          <motion.div
            initial={{ opacity: 0.5, scaleY: 1 }}
            animate={{ opacity: [0.4, 1, 0.4], scaleY: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              top: "52%",
              height: 22,
              borderRadius: 8,
              background: "linear-gradient(90deg, rgba(212,244,90,0.1), rgba(212,244,90,0.5), rgba(212,244,90,0.1))",
              boxShadow: "0 0 30px rgba(212,244,90,0.5)",
              border: "1px solid rgba(212,244,90,0.6)",
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--signal)", letterSpacing: 0.15 }}>
            device prep
          </div>
          <div className="serif" style={{ fontSize: 34, color: "var(--fog-0)", lineHeight: 1.15, letterSpacing: -0.01 }}>
            {isStarting ? (
              <>Syncing with the <em style={{ color: "var(--signal)" }}>Hydrawav3 belt</em></>
            ) : (
              <>Strap the <em style={{ color: "var(--signal)" }}>Hydrawav3 belt</em> at the lumbar line</>
            )}
          </div>
          <div style={{ fontSize: 14, color: "var(--fog-2)", lineHeight: 1.5, maxWidth: 420 }}>
            {isStarting
              ? "Device paired. Warming the coil array and stabilizing the 40Hz carrier before audio lead-in."
              : "Centered across L4 to L5. Snug, not tight. The glow indicates placement. Session will begin automatically."}
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(212,244,90,0.05)",
              border: "1px solid rgba(212,244,90,0.2)",
              maxWidth: 420,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isStarting ? "var(--signal)" : "var(--signal-dim)",
                boxShadow: isStarting ? "0 0 12px var(--signal)" : "none",
                animation: "breathe 1.4s infinite",
              }}
            />
            <div className="mono" style={{ fontSize: 11, color: "var(--fog-2)" }}>
              {isStarting
                ? mqttAck ?? "waiting for device ack"
                : `auto-begin in ${countdown}s`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onSkip}
              disabled={isStarting}
              style={{
                height: 44,
                padding: "0 22px",
                borderRadius: 10,
                background: "var(--signal)",
                color: "var(--signal-ink)",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--sans)",
                border: "none",
                cursor: isStarting ? "wait" : "pointer",
                opacity: isStarting ? 0.6 : 1,
              }}
            >
              Belt secured · begin now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ROM Gate Overlay ────────────────────────────────────────────────────────
// Blocks session end until all after-captures are done

function RomGateOverlay({
  clientId,
  captures,
  onDone,
  onDismiss,
}: {
  clientId: string;
  captures: Record<string, import("@/lib/pose-store").PoseCapture>;
  onDone: () => void;
  onDismiss: () => void;
}) {
  const allDone = MOVEMENTS.every((m) => !!captures[`${clientId}:after:${m.id}`]);

  useEffect(() => {
    if (allDone) onDone();
  }, [allDone, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(6,8,12,0.96)", backdropFilter: "blur(10px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
        padding: 40,
      }}
    >
      <div className="mono upper" style={{ fontSize: 10, color: "var(--flare)" }}>
        ⚠ capture required before ending
      </div>
      <div className="serif" style={{ fontSize: 28, color: "var(--fog-0)", textAlign: "center", maxWidth: 480 }}>
        Capture <em style={{ color: "var(--signal)" }}>after-session ROM</em> to measure improvement
      </div>
      <div style={{ fontSize: 13, color: "var(--fog-3)", textAlign: "center", maxWidth: 400 }}>
        Both movements must be captured so the client can see their progress. Takes under 30 seconds.
      </div>

      {/* Per-movement status */}
      <div style={{ display: "flex", gap: 12 }}>
        {MOVEMENTS.map((m) => {
          const done = !!captures[`${clientId}:after:${m.id}`];
          return (
            <div
              key={m.id}
              style={{
                padding: "10px 18px", borderRadius: 10,
                background: done ? "rgba(34,197,94,0.08)" : "var(--ink-2)",
                border: `1px solid ${done ? "rgba(34,197,94,0.3)" : "var(--ink-3)"}`,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: 12, color: done ? "#4ade80" : "var(--fog-0)", fontWeight: 600 }}>{m.label}</div>
                <div className="mono" style={{ fontSize: 9, color: done ? "#4ade80" : "var(--fog-3)" }}>
                  {done ? "✓ captured" : "pending"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline capture panel */}
      <div style={{ width: "100%", maxWidth: 480 }}>
        <PoseCapturePanel clientId={clientId} phase="after" />
      </div>

      <button
        onClick={onDismiss}
        style={{
          fontSize: 11, color: "var(--fog-3)", background: "none",
          border: "none", cursor: "pointer", fontFamily: "var(--mono)",
        }}
      >
        ← back to session
      </button>
    </motion.div>
  );
}

// ─── Improvement Summary Overlay ─────────────────────────────────────────────
// Full-screen before/after comparison shown before navigating away

function ImprovementSummaryOverlay({
  clientId,
  captures,
  onConfirm,
}: {
  clientId: string;
  captures: Record<string, import("@/lib/pose-store").PoseCapture>;
  onConfirm: () => void;
}) {
  const pairs = MOVEMENTS.map((m) => ({
    movement: m,
    before: captures[`${clientId}:before:${m.id}`] ?? null,
    after: captures[`${clientId}:after:${m.id}`] ?? null,
  })).filter((p) => p.before && p.after);

  // Compute overall improvement score (avg delta % across movements)
  const scores = pairs.map(({ before, after }) => {
    if (!before || !after) return 0;
    const delta = after.primary.value - before.primary.value;
    const lowerIsBetter = before.primary.lowerIsBetter === true;
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    const pct = before.primary.value > 0 ? Math.abs(delta / before.primary.value) * 100 : 0;
    return improved ? pct : -pct;
  });
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const overallImproved = avgScore > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(6,8,12,0.97)", backdropFilter: "blur(12px)",
        display: "flex", flexDirection: "column", overflow: "auto",
      }}
    >
      {/* Header */}
      <div style={{ padding: "28px 40px 0", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>session complete</div>
          <div className="serif" style={{ fontSize: 28, color: "var(--fog-0)", marginTop: 4 }}>
            Movement <em style={{ color: overallImproved ? "var(--signal)" : "var(--flare)" }}>
              {overallImproved ? "improved" : "unchanged"}
            </em> this session
          </div>
        </div>
        <span style={{ flex: 1 }} />
        {/* Overall score badge */}
        <div
          style={{
            padding: "12px 20px", borderRadius: 14,
            background: overallImproved ? "rgba(212,244,90,0.1)" : "rgba(255,106,61,0.08)",
            border: `1px solid ${overallImproved ? "rgba(212,244,90,0.35)" : "rgba(255,106,61,0.3)"}`,
            textAlign: "center",
          }}
        >
          <div
            className="mono tnum"
            style={{ fontSize: 32, fontWeight: 700, color: overallImproved ? "var(--signal)" : "var(--flare)" }}
          >
            {overallImproved ? "+" : ""}{Math.round(avgScore)}%
          </div>
          <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginTop: 2 }}>avg ROM delta</div>
        </div>
      </div>

      {/* Per-movement comparisons */}
      <div style={{ padding: "24px 40px", display: "flex", gap: 24, flex: 1 }}>
        {pairs.map(({ movement, before, after }) => {
          if (!before || !after) return null;
          const delta = after.primary.value - before.primary.value;
          const lowerIsBetter = before.primary.lowerIsBetter === true;
          const improved = lowerIsBetter ? delta < 0 : delta > 0;
          const absDelta = Math.abs(delta);

          return (
            <motion.div
              key={movement.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                flex: 1, background: "var(--ink-2)", borderRadius: 16,
                border: `1px solid ${improved ? "rgba(212,244,90,0.2)" : "var(--ink-3)"}`,
                padding: 20, display: "flex", flexDirection: "column", gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{movement.icon}</span>
                <div>
                  <div style={{ fontSize: 14, color: "var(--fog-0)", fontWeight: 600 }}>{movement.label}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>{movement.zone}</div>
                </div>
                <span style={{ flex: 1 }} />
                <div
                  style={{
                    padding: "4px 10px", borderRadius: 8,
                    background: improved ? "rgba(212,244,90,0.1)" : "rgba(255,106,61,0.08)",
                    color: improved ? "#4ade80" : "#f87171",
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  {improved ? "+" : ""}{lowerIsBetter && delta < 0 ? "-" : ""}{absDelta}{before.primary.unit}
                </div>
              </div>

              {/* Snapshots */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[{ label: "before", snap: before.snapshot }, { label: "after", snap: after.snapshot }].map(({ label, snap }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: "1px solid var(--ink-3)" }}>
                      <img src={snap} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", textAlign: "center" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Metric row */}
              <div style={{ textAlign: "center", padding: "10px 0", borderTop: "1px solid var(--ink-3)" }}>
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginBottom: 6 }}>
                  {before.primary.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  <span style={{ color: "var(--fog-3)" }}>{before.primary.value}{before.primary.unit}</span>
                  <span style={{ color: "var(--fog-3)", margin: "0 10px", fontSize: 16 }}>→</span>
                  <span style={{ color: improved ? "#86efac" : "#fca5a5" }}>
                    {after.primary.value}{after.primary.unit}
                  </span>
                </div>
                {before.secondary && after.secondary && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 6 }}>
                    {before.secondary.label}: {before.secondary.value}{before.secondary.unit}
                    {" → "}
                    {after.secondary.value}{after.secondary.unit}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "0 40px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, color: "var(--fog-3)" }}>
          These results will be included in the client&apos;s summary card.
        </div>
        <span style={{ flex: 1 }} />
        <button
          onClick={onConfirm}
          style={{
            height: 44, padding: "0 32px", borderRadius: 10,
            background: "var(--signal)", color: "var(--signal-ink)",
            fontSize: 14, fontWeight: 600, fontFamily: "var(--sans)",
            border: "none", cursor: "pointer",
          }}
        >
          Save &amp; send summary →
        </button>
      </div>
    </motion.div>
  );
}
