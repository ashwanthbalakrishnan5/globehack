"use client";

/**
 * PoseCapture — MediaPipe-powered ROM snapshot component.
 * Ports the CV/ folder logic into the main Next.js app as a TSX component.
 * Uses dynamic import so MediaPipe WASM only loads client-side.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { PoseCapture as PoseCaptureData } from "@/lib/pose-store";

// ─── Angle math (ported from CV/utils/angles.js) ─────────────────────────────

function calcAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x ** 2 + ab.y ** 2) * Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (mag === 0) return 0;
  return Math.round(Math.acos(Math.min(1, Math.max(-1, dot / mag))) * (180 / Math.PI));
}

type Landmark = { x: number; y: number; z: number; visibility?: number };

function computeAngles(lms: Landmark[], movementId: string): PoseCaptureData | null {
  const lm = (i: number) => lms[i];
  if (movementId === "hip_flexion") {
    const lKnee = calcAngle(lm(23), lm(25), lm(27));
    const rKnee = calcAngle(lm(24), lm(26), lm(28));
    const lVis = (lm(25).visibility ?? 0) + (lm(23).visibility ?? 0) + (lm(27).visibility ?? 0);
    const rVis = (lm(26).visibility ?? 0) + (lm(24).visibility ?? 0) + (lm(28).visibility ?? 0);
    const best = lVis >= rVis ? lKnee : rKnee;
    return {
      snapshot: "",
      primary: { label: "Squat Depth Score", value: 180 - best, unit: "°" },
      secondary: { label: "Knee Angle", value: best, unit: "°" },
      movementId,
      movementLabel: "Squat Depth",
      capturedAt: new Date().toISOString(),
    };
  }
  if (movementId === "shoulder_flexion") {
    const l = calcAngle(lm(23), lm(11), lm(15));
    const r = calcAngle(lm(24), lm(12), lm(16));
    return {
      snapshot: "",
      primary: { label: "Shoulder Flexion", value: Math.round((l + r) / 2), unit: "°" },
      secondary: { label: "L/R Asymmetry", value: Math.abs(l - r), unit: "°" },
      movementId,
      movementLabel: "Shoulder Flexion",
      capturedAt: new Date().toISOString(),
    };
  }
  return null;
}

// ─── Movement definitions ─────────────────────────────────────────────────────

export const MOVEMENTS = [
  {
    id: "hip_flexion",
    label: "Squat Depth",
    zone: "Knees / Hips",
    icon: "🦵",
    instruction: "Stand side-on to the camera. Squat as deep as you comfortably can.",
    camera: "side",
  },
  {
    id: "shoulder_flexion",
    label: "Shoulder Flexion",
    zone: "Shoulders",
    icon: "🙋",
    instruction: "Face the camera. Raise both arms overhead as high as possible.",
    camera: "front",
  },
] as const;

export type Movement = (typeof MOVEMENTS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  movement: Movement;
  label: "Before" | "After";
  onCapture: (data: PoseCaptureData) => void;
}

const COUNTDOWN = 3;

export function PoseCapture({ movement, label, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<unknown>(null);
  const rafRef = useRef<number | null>(null);
  const latestAnglesRef = useRef<Omit<PoseCaptureData, "snapshot"> | null>(null);

  const [ready, setReady] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [liveAngles, setLiveAngles] = useState<PoseCaptureData | null>(null);

  // Init camera
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch (e) {
        console.error("Camera error:", e);
      }
    }
    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Init MediaPipe
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const pl = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (!cancelled) { landmarkerRef.current = pl; setReady(true); }
      } catch (e) {
        console.error("MediaPipe init error:", e);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Detection loop
  useEffect(() => {
    if (!ready || !streaming) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let lastTime = -1;

    async function detect() {
      rafRef.current = requestAnimationFrame(detect);
      if (!video || video.readyState < 2 || !canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const now = performance.now();
      if (now === lastTime) return;
      lastTime = now;

      const { DrawingUtils, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lm = landmarkerRef.current as any;
      if (!lm) return;
      const result = lm.detectForVideo(video, now);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (result.landmarks?.length > 0) {
        const landmarks = result.landmarks[0] as Landmark[];
        const du = new DrawingUtils(ctx);
        du.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: "rgba(122,156,196,0.8)",
          lineWidth: 2,
        });
        du.drawLandmarks(landmarks, { color: "#7a9cc4", fillColor: "#0d1120", radius: 4 });

        const angles = computeAngles(landmarks, movement.id);
        if (angles) {
          latestAnglesRef.current = angles;
          setLiveAngles(angles);
        }
      }
    }

    detect();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [ready, streaming, movement.id]);

  const doCapture = useCallback(() => {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    const angles = latestAnglesRef.current;
    if (!video || !overlay || !angles) return;
    const out = document.createElement("canvas");
    out.width = video.videoWidth || 640;
    out.height = video.videoHeight || 480;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, out.width, out.height);
    ctx.drawImage(overlay, 0, 0, out.width, out.height);
    const result: PoseCaptureData = {
      ...angles,
      snapshot: out.toDataURL("image/png"),
      capturedAt: new Date().toISOString(),
    };
    setCaptured(true);
    onCapture(result);
  }, [onCapture]);

  const startCountdown = useCallback(() => {
    if (countdown !== null) return;
    let count = COUNTDOWN;
    setCountdown(count);
    const id = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(id);
        setCountdown(null);
        doCapture();
      }
    }, 1000);
  }, [countdown, doCapture]);

  const circumference = 2 * Math.PI * 44;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
      {/* Instruction */}
      {!captured && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            borderRadius: 12,
            padding: "10px 14px",
            width: "100%",
          }}
        >
          <span style={{ fontSize: 22 }}>{movement.icon}</span>
          <div>
            <div style={{ fontSize: 12, color: "var(--fog-0)", fontWeight: 600 }}>{movement.label}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
              {movement.instruction}
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 2 }}>
              📷 {movement.camera === "side" ? "Position camera to your side" : "Face the camera directly"}
            </div>
          </div>
        </div>
      )}

      {/* Video */}
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--ink-3)",
          width: "100%",
          aspectRatio: "4/3",
        }}
      >
        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

        {/* Live angle overlay */}
        {liveAngles && !captured && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              borderRadius: 8,
              padding: "6px 10px",
            }}
          >
            <div style={{ fontSize: 18, color: "var(--fog-0)", fontWeight: 700, lineHeight: 1 }}>
              {liveAngles.primary.value}
              <span style={{ fontSize: 11, color: "var(--fog-3)" }}>{liveAngles.primary.unit}</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>{liveAngles.primary.label}</div>
          </div>
        )}

        {/* Countdown ring */}
        {countdown !== null && countdown > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ position: "relative", width: 96, height: 96 }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="44" fill="none" stroke="#d4f45a" strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (countdown / COUNTDOWN)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.95s linear" }}
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* Captured overlay */}
        {captured && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(34,197,94,0.25)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div style={{ fontSize: 16, color: "#86efac", fontWeight: 700 }}>✓ {label} saved</div>
          </div>
        )}

        {/* Loading */}
        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
            }}
          >
            <div className="mono" style={{ fontSize: 11, color: "var(--fog-3)" }}>Loading MediaPipe…</div>
          </div>
        )}
      </div>

      {/* Action */}
      {!captured ? (
        <button
          onClick={startCountdown}
          disabled={!ready || countdown !== null}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: !ready || countdown !== null ? "var(--ink-3)" : "var(--signal)",
            color: !ready || countdown !== null ? "var(--fog-3)" : "var(--signal-ink)",
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            cursor: !ready || countdown !== null ? "not-allowed" : "pointer",
            fontFamily: "var(--sans)",
          }}
        >
          {countdown !== null ? `Capturing in ${countdown}…` : `📸 Capture ${label}`}
        </button>
      ) : null}
    </div>
  );
}
