"use client";

import { CSSProperties, ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────
   Shared primitives for Tide designs.
   Ported from design bundle primitives.jsx.
   ────────────────────────────────────────────────────────────── */

export function TideMark({
  size = 28,
  color = "var(--signal)",
  animate = true,
}: {
  size?: number;
  color?: string;
  animate?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`tg-${color}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M2 22 Q 10 14, 16 22 T 30 22"
        fill="none"
        stroke={`url(#tg-${color})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        {animate && (
          <animate
            attributeName="d"
            values="M2 22 Q 10 14, 16 22 T 30 22;M2 22 Q 10 28, 16 22 T 30 22;M2 22 Q 10 14, 16 22 T 30 22"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </path>
      <path
        d="M2 16 Q 10 8, 16 16 T 30 16"
        fill="none"
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {animate && (
          <animate
            attributeName="d"
            values="M2 16 Q 10 8, 16 16 T 30 16;M2 16 Q 10 22, 16 16 T 30 16;M2 16 Q 10 8, 16 16 T 30 16"
            dur="3.2s"
            repeatCount="indefinite"
          />
        )}
      </path>
      <path
        d="M2 10 Q 10 4, 16 10 T 30 10"
        fill="none"
        stroke={color}
        strokeOpacity="0.25"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        {animate && (
          <animate
            attributeName="d"
            values="M2 10 Q 10 4, 16 10 T 30 10;M2 10 Q 10 16, 16 10 T 30 10;M2 10 Q 10 4, 16 10 T 30 10"
            dur="2.6s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </svg>
  );
}

export function WavePath({
  width = 600,
  height = 80,
  color = "var(--signal)",
  stroke = 1.6,
  amp = 0.6,
  freq = 3,
  phase = 0,
}: {
  width?: number;
  height?: number;
  color?: string;
  stroke?: number;
  amp?: number;
  freq?: number;
  phase?: number;
}) {
  const pts: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * width;
    const y =
      height / 2 +
      Math.sin(t * Math.PI * freq * 2 + phase) * (height / 2) * amp +
      Math.sin(t * Math.PI * freq * 0.5 + phase * 2) * (height / 2) * amp * 0.3;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

export function RingGauge({
  size = 80,
  pct = 68,
  stroke = 6,
  color = "var(--signal)",
  trackColor = "var(--ink-3)",
  label,
  value,
}: {
  size?: number;
  pct?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  value?: string | number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      {(value !== undefined || label) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {value !== undefined && (
            <div
              className="mono tnum"
              style={{
                fontSize: size * 0.28,
                fontWeight: 500,
                color: "var(--fog-0)",
                lineHeight: 1,
              }}
            >
              {value}
            </div>
          )}
          {label && (
            <div
              className="mono upper"
              style={{ fontSize: 8, color: "var(--fog-3)", marginTop: 2 }}
            >
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Meter({
  pct = 50,
  color = "var(--signal)",
  height = 4,
  delay = 0,
}: {
  pct?: number;
  color?: string;
  height?: number;
  delay?: number;
}) {
  return (
    <div
      style={{
        height,
        width: "100%",
        background: "var(--ink-3)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          background: color,
          borderRadius: 999,
          width: `${pct}%`,
          transition: `width 1.2s ${delay}s cubic-bezier(.2,.9,.3,1)`,
        }}
      />
    </div>
  );
}

export function VoiceWave({
  color = "var(--signal)",
  bars = 32,
  active = true,
}: {
  color?: string;
  bars?: number;
  active?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 56 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = i / bars;
        const amp = 0.3 + Math.abs(Math.sin(phase * Math.PI)) * 0.7;
        return (
          <div
            key={i}
            style={{
              width: 3,
              borderRadius: 999,
              background: color,
              height: `${20 + amp * 80}%`,
              animation: active
                ? `breathe ${0.8 + amp * 0.8}s ease-in-out ${phase * 0.4}s infinite`
                : "none",
              opacity: active ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

export function BioGrid({
  color = "rgba(212,244,90,0.08)",
  size = 20,
  opacity = 1,
}: {
  color?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

export function HRVSpark({
  data,
  width = 200,
  height = 40,
  color = "var(--signal)",
  threshold,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  threshold?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {threshold !== undefined &&
        (() => {
          const ty = height - ((threshold - min) / range) * (height - 4) - 2;
          return (
            <line
              x1="0"
              x2={width}
              y1={ty}
              y2={ty}
              stroke="var(--flare)"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          );
        })()}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return <circle key={i} cx={x} cy={y} r={1.8} fill={color} />;
      })}
    </svg>
  );
}

export function Tag({
  children,
  color = "var(--signal)",
  variant = "outline",
  size = "sm",
  style,
}: {
  children: ReactNode;
  color?: string;
  variant?: "outline" | "solid";
  size?: "sm" | "md";
  style?: CSSProperties;
}) {
  const pad = size === "sm" ? "3px 8px" : "5px 10px";
  const fs = size === "sm" ? 10 : 11;
  if (variant === "solid") {
    return (
      <span
        className="mono upper"
        style={{
          padding: pad,
          fontSize: fs,
          background: color,
          color: "var(--signal-ink)",
          borderRadius: 4,
          fontWeight: 600,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="mono upper"
      style={{
        padding: pad,
        fontSize: fs,
        color,
        border: `1px solid ${color}`,
        borderRadius: 4,
        fontWeight: 500,
        background: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
