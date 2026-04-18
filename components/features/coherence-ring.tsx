"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ═══════════════════════════════════════════════
   CoherenceRing — breath-paced live ring + HRV score climb.
   Optional mic input (getUserMedia) for real-amplitude response.
   Ported from design bundle features.jsx.
   ═══════════════════════════════════════════════ */

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function breathCurve(p: number) {
  if (p < 0.36) {
    const t = p / 0.36;
    return 0.82 + (1.08 - 0.82) * easeInOut(t);
  }
  if (p < 0.45) return 1.08;
  if (p < 0.91) {
    const t = (p - 0.45) / 0.46;
    return 1.08 - (1.08 - 0.82) * easeInOut(t);
  }
  return 0.82;
}

function breathLabel(p: number) {
  if (p < 0.36) return "breathe in · 2.0";
  if (p < 0.45) return "hold · 0.5";
  if (p < 0.91) return "release · 2.5";
  return "pause";
}

function breathArcPath(cx: number, cy: number, r: number, phase: number) {
  const startA = -Math.PI / 2;
  const endA = startA + phase * Math.PI * 2;
  const x1 = cx + Math.cos(startA) * r;
  const y1 = cy + Math.sin(startA) * r;
  const x2 = cx + Math.cos(endA) * r;
  const y2 = cy + Math.sin(endA) * r;
  const large = phase > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function CoherenceRing({
  size = 360,
  duration = 14,
  useMic = false,
}: {
  size?: number;
  duration?: number;
  useMic?: boolean;
}) {
  const [phase, setPhase] = useState(0);
  const [score, setScore] = useState(42);
  const [live, setLive] = useState(false);
  const [amp, setAmp] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef<number>(0);
  const audioRef = useRef<{
    ctx: AudioContext;
    analyser: AnalyserNode;
    data: Uint8Array<ArrayBuffer>;
    stream: MediaStream;
  } | null>(null);

  useEffect(() => {
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (!useMic) return;
    let cancel = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancel) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser);
        const data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        audioRef.current = { ctx, analyser, data, stream };
        setLive(true);
      } catch {
        /* mic denied — stay simulated */
      }
    })();
    return () => {
      cancel = true;
      if (audioRef.current) {
        audioRef.current.stream?.getTracks()?.forEach((t) => t.stop());
        audioRef.current.ctx?.close();
      }
    };
  }, [useMic]);

  useEffect(() => {
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      const p = (t % 5.5) / 5.5;
      setPhase(p);
      const settled = Math.min(1, t / duration);
      const base = 42 + (78 - 42) * easeOutCubic(settled);
      const drift = Math.sin(t * 0.8) * 1.5;
      setScore(base + drift);
      if (audioRef.current?.analyser) {
        const { analyser, data } = audioRef.current;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setAmp(Math.min(1, Math.sqrt(sum / data.length) * 3));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  const breathScale = breathCurve(phase);
  const liveScale = 1 - amp * 0.12;

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.42;

  const segments = 60;
  const scoreNorm = (score - 30) / 60;
  const activeCount = Math.round(segments * scoreNorm);

  const waveform = useMemo(() => {
    const pts: number[] = [];
    const n = 64;
    for (let i = 0; i < n; i++) {
      const x = i / (n - 1);
      const chaos = 1 - Math.min(1, (performance.now() - startRef.current) / 1000 / duration);
      const sine = Math.sin(x * Math.PI * 4);
      const noise = (Math.random() - 0.5) * 2;
      pts.push(sine * (1 - chaos) + noise * chaos);
    }
    return pts;
    // deliberately re-compute each time score integer changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(score)]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="cr-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--signal)" stopOpacity="0.12" />
            <stop offset="0.6" stopColor="var(--signal)" stopOpacity="0.03" />
            <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
          </radialGradient>
          <filter id="cr-glow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={R * 1.3} fill="url(#cr-core)" />

        {Array.from({ length: segments }).map((_, i) => {
          const a = (i / segments) * Math.PI * 2 - Math.PI / 2;
          const active = i < activeCount;
          const r1 = R + 10;
          const r2 = R + (active ? 20 : 16);
          const x1 = cx + Math.cos(a) * r1;
          const y1 = cy + Math.sin(a) * r1;
          const x2 = cx + Math.cos(a) * r2;
          const y2 = cy + Math.sin(a) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={active ? "var(--signal)" : "var(--ink-4)"}
              strokeWidth={active ? 2 : 1}
              strokeLinecap="round"
              opacity={active ? 0.85 : 0.4}
            />
          );
        })}

        <g transform={`translate(${cx} ${cy}) scale(${breathScale * liveScale})`}>
          <circle cx="0" cy="0" r={R * 0.82} fill="none" stroke="var(--signal)" strokeWidth="1.5" strokeDasharray="1 3" opacity="0.6" />
          <circle cx="0" cy="0" r={R * 0.72} fill="none" stroke="var(--signal)" strokeWidth="0.7" opacity="0.35" />
        </g>

        <circle cx={cx} cy={cy} r={R * 0.56} fill="rgba(7,9,12,0.8)" stroke="var(--ink-3)" strokeWidth="1" />

        <g transform={`translate(${cx - R * 0.42}, ${cy + R * 0.15})`}>
          <polyline
            fill="none"
            stroke="var(--signal)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
            points={waveform
              .map((v, i) => {
                const x = (i / (waveform.length - 1)) * R * 0.84;
                const y = -v * 12;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ")}
          />
        </g>

        <text
          x={cx}
          y={cy - R * 0.05}
          textAnchor="middle"
          fontSize={R * 0.6}
          fontFamily="var(--mono)"
          fill="var(--fog-0)"
          fontWeight="300"
          style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em" }}
        >
          {Math.round(score)}
        </text>
        <text
          x={cx}
          y={cy + R * 0.18}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--mono)"
          fill="var(--fog-3)"
          style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          coherence
        </text>

        <g>
          <path
            d={breathArcPath(cx, cy, R + 32, phase)}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          top: size * 0.08,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          fontFamily: "var(--mono)",
          textTransform: "uppercase",
          letterSpacing: 0.18,
          color: "var(--signal)",
          background: "rgba(7,9,12,0.6)",
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid rgba(212,244,90,0.3)",
          whiteSpace: "nowrap",
        }}
      >
        {breathLabel(phase)}
      </div>

      {useMic && (
        <div
          style={{
            position: "absolute",
            bottom: size * 0.08,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 9,
            fontFamily: "var(--mono)",
            textTransform: "uppercase",
            color: live ? "var(--signal)" : "var(--fog-3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: live ? "var(--signal)" : "var(--fog-3)",
              boxShadow: live ? "0 0 8px var(--signal)" : "none",
            }}
          />
          {live ? `mic · ${Math.round(amp * 100)}` : "simulated"}
        </div>
      )}
    </div>
  );
}
