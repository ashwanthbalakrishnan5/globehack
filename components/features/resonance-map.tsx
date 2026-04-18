"use client";

import { CSSProperties } from "react";

/* ═══════════════════════════════════════════════
   ResonanceMap — signature data-viz.
   Silhouette + heat zones + belt + 40Hz ripple.
   Ported from design bundle features.jsx.
   ═══════════════════════════════════════════════ */

type ZoneColor = "flare" | "spark" | "cool" | "signal";

type Zone = {
  id: string;
  view: "front" | "back";
  x: number;
  y: number;
  r: number;
  intensity: number;
  label: string;
  sub: string;
  color: ZoneColor;
};

const DEFAULT_ZONES: Zone[] = [
  { id: "ltrap",    view: "back",  x: 38, y: 22, r: 11, intensity: 0.92, label: "L trap",       sub: "×4 sessions", color: "flare" },
  { id: "rtrap",    view: "back",  x: 62, y: 22, r: 6,  intensity: 0.22, label: "R trap",       sub: "baseline",    color: "cool" },
  { id: "spine-mid",view: "back",  x: 50, y: 38, r: 7,  intensity: 0.45, label: "T6–T8",        sub: "guarded",     color: "spark" },
  { id: "lowback",  view: "back",  x: 50, y: 58, r: 9,  intensity: 0.66, label: "L4–L5",        sub: "belt target", color: "spark" },
  { id: "rhip",     view: "back",  x: 62, y: 70, r: 7,  intensity: 0.40, label: "R hip",        sub: "asymmetric",  color: "spark" },
  { id: "hipflexR", view: "front", x: 58, y: 64, r: 8,  intensity: 0.58, label: "R hip flexor", sub: "×2",          color: "spark" },
  { id: "jaw",      view: "front", x: 50, y: 10, r: 5,  intensity: 0.35, label: "jaw",          sub: "bracing",     color: "cool" },
  { id: "chest",    view: "front", x: 50, y: 28, r: 6,  intensity: 0.30, label: "sternum",      sub: "shallow",     color: "cool" },
];

const COLOR_MAP: Record<ZoneColor, string> = {
  flare: "var(--flare)",
  spark: "var(--spark)",
  cool: "var(--cool)",
  signal: "var(--signal)",
};

function silhouettePath(): string {
  return `
    M 50 8
    C 46 8 44 11 44 15
    C 44 18 45 21 47 23
    C 42 24 35 26 32 32
    C 30 36 30 42 31 48
    C 32 54 32 60 31 66
    C 31 72 32 78 34 84
    L 36 100
    L 37 116
    C 37 124 36 132 38 140
    L 42 152
    L 46 152
    L 45 140
    L 45 118
    L 47 100
    L 49 88
    L 51 88
    L 53 100
    L 55 118
    L 55 140
    L 54 152
    L 58 152
    L 62 140
    C 64 132 63 124 63 116
    L 64 100
    L 66 84
    C 68 78 69 72 69 66
    C 68 60 68 54 69 48
    C 70 42 70 36 68 32
    C 65 26 58 24 53 23
    C 55 21 56 18 56 15
    C 56 11 54 8 50 8
    Z
  `
    .trim()
    .replace(/\s+/g, " ");
}

function contourLines(view: "front" | "back"): string[] {
  if (view === "back") {
    return [
      "M 50 23 L 50 100",
      "M 42 30 Q 46 36 42 44",
      "M 58 30 Q 54 36 58 44",
      "M 36 44 Q 42 52 40 64",
      "M 64 44 Q 58 52 60 64",
      "M 34 58 Q 50 62 66 58",
      "M 42 80 Q 50 82 58 80",
      "M 46 108 L 47 140",
      "M 54 108 L 53 140",
    ];
  }
  return [
    "M 46 14 Q 50 16 54 14",
    "M 46 22 L 46 24",
    "M 54 22 L 54 24",
    "M 38 28 Q 50 30 62 28",
    "M 50 32 L 50 54",
    "M 40 36 Q 46 42 42 50",
    "M 60 36 Q 54 42 58 50",
    "M 46 52 L 46 66",
    "M 54 52 L 54 66",
    "M 46 56 L 54 56",
    "M 46 60 L 54 60",
    "M 42 70 Q 50 74 58 70",
    "M 46 84 L 47 130",
    "M 54 84 L 53 130",
  ];
}

export function ResonanceMap({
  height = 640,
  view = "back",
  showBelt = true,
  showRipple = true,
  zones = null,
  label = true,
  style,
}: {
  height?: number;
  view?: "front" | "back";
  showBelt?: boolean;
  showRipple?: boolean;
  zones?: Zone[] | null;
  label?: boolean;
  style?: CSSProperties;
}) {
  const zs = (zones || DEFAULT_ZONES).filter((z) => z.view === view);
  const belt = view === "back" ? { x: 50, y: 58, w: 56, h: 7 } : { x: 50, y: 60, w: 54, h: 8 };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        background: `
          radial-gradient(ellipse 50% 40% at 50% 45%, rgba(212,244,90,0.04), transparent 70%),
          radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20,24,32,0.8), transparent 70%)
        `,
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 160"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="rm-skin" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#1a2028" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#262d37" stopOpacity="1" />
            <stop offset="1" stopColor="#1a2028" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="rm-shine" cx="0.5" cy="0.3" r="0.6">
            <stop offset="0" stopColor="#323a45" stopOpacity="0.9" />
            <stop offset="1" stopColor="#1a2028" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rm-heat-flare">
            <stop offset="0" stopColor="var(--flare)" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="var(--flare)" stopOpacity="0.4" />
            <stop offset="1" stopColor="var(--flare)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rm-heat-spark">
            <stop offset="0" stopColor="var(--spark)" stopOpacity="0.85" />
            <stop offset="0.4" stopColor="var(--spark)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--spark)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rm-heat-cool">
            <stop offset="0" stopColor="var(--cool)" stopOpacity="0.7" />
            <stop offset="0.4" stopColor="var(--cool)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--cool)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rm-belt-glow">
            <stop offset="0" stopColor="var(--signal)" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="var(--signal)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
          </radialGradient>
          <filter id="rm-blur-sm"><feGaussianBlur stdDeviation="0.6" /></filter>
          <filter id="rm-blur-md"><feGaussianBlur stdDeviation="1.2" /></filter>
          <clipPath id={`rm-clip-${view}`}>
            <path d={silhouettePath()} />
          </clipPath>
        </defs>

        <g opacity="0.25">
          {[130, 138, 145, 150, 154].map((y, i) => (
            <ellipse
              key={i}
              cx="50"
              cy={y}
              rx={30 + i * 4}
              ry={1 + i * 0.3}
              fill="none"
              stroke="var(--signal)"
              strokeWidth="0.15"
              strokeDasharray="0.4 0.8"
            />
          ))}
          <line x1="20" y1="130" x2="5" y2="160" stroke="var(--signal)" strokeWidth="0.1" />
          <line x1="80" y1="130" x2="95" y2="160" stroke="var(--signal)" strokeWidth="0.1" />
          <line x1="50" y1="130" x2="50" y2="160" stroke="var(--signal)" strokeWidth="0.1" />
        </g>

        <path d={silhouettePath()} fill="url(#rm-skin)" stroke="#3a434f" strokeWidth="0.25" />
        <path d={silhouettePath()} fill="url(#rm-shine)" opacity="0.7" />

        <g clipPath={`url(#rm-clip-${view})`} opacity="0.35">
          {contourLines(view).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#4a5664" strokeWidth="0.2" />
          ))}
        </g>

        <g clipPath={`url(#rm-clip-${view})`}>
          {zs.map((z, i) => {
            const grad =
              z.color === "flare"
                ? "rm-heat-flare"
                : z.color === "spark"
                ? "rm-heat-spark"
                : "rm-heat-cool";
            const baseR = z.r * (0.9 + z.intensity * 0.4);
            return (
              <g key={z.id}>
                <circle cx={z.x} cy={z.y} r={baseR * 2.2} fill={`url(#${grad})`} filter="url(#rm-blur-md)" />
                <circle
                  cx={z.x}
                  cy={z.y}
                  r={baseR * 0.6}
                  fill={COLOR_MAP[z.color]}
                  opacity={z.intensity * 0.9}
                >
                  <animate
                    attributeName="r"
                    values={`${baseR * 0.5};${baseR * 0.8};${baseR * 0.5}`}
                    dur={`${2 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values={`${z.intensity * 0.7};${z.intensity};${z.intensity * 0.7}`}
                    dur={`${2 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </g>

        {showBelt && view === "back" && (
          <g>
            {showRipple && (
              <g>
                {[0, 1, 2].map((i) => (
                  <ellipse
                    key={i}
                    cx={belt.x}
                    cy={belt.y}
                    rx="14"
                    ry="3.5"
                    fill="none"
                    stroke="var(--signal)"
                    strokeWidth="0.3"
                    opacity="0"
                  >
                    <animate attributeName="rx" values="8;32;40" dur="2.8s" repeatCount="indefinite" begin={`${i * 0.93}s`} />
                    <animate attributeName="ry" values="2;8;10" dur="2.8s" repeatCount="indefinite" begin={`${i * 0.93}s`} />
                    <animate attributeName="opacity" values="0.7;0.3;0" dur="2.8s" repeatCount="indefinite" begin={`${i * 0.93}s`} />
                    <animate attributeName="stroke-width" values="0.5;0.2;0.05" dur="2.8s" repeatCount="indefinite" begin={`${i * 0.93}s`} />
                  </ellipse>
                ))}
              </g>
            )}

            <ellipse cx={belt.x} cy={belt.y} rx="22" ry="6" fill="url(#rm-belt-glow)" />

            <g>
              <rect
                x={belt.x - belt.w / 2}
                y={belt.y - belt.h / 2}
                width={belt.w}
                height={belt.h}
                rx={belt.h / 2}
                fill="#1a1f27"
                stroke="var(--signal)"
                strokeWidth="0.3"
              />
              <rect x={belt.x - 4} y={belt.y - 2.5} width="8" height="5" rx="1.5" fill="#2a323c" stroke="var(--signal)" strokeWidth="0.25" />
              <circle cx={belt.x} cy={belt.y} r="1.2" fill="var(--signal)">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {[-18, -12, -6, 6, 12, 18].map((dx, i) => (
                <circle key={i} cx={belt.x + dx} cy={belt.y} r="0.5" fill="var(--signal)" opacity="0.5">
                  <animate
                    attributeName="opacity"
                    values="0.2;0.9;0.2"
                    dur="1.5s"
                    repeatCount="indefinite"
                    begin={`${Math.abs(dx) * 0.05}s`}
                  />
                </circle>
              ))}
            </g>

            <line
              x1={belt.x + 30}
              y1={belt.y}
              x2={belt.x + 44}
              y2={belt.y - 8}
              stroke="var(--signal)"
              strokeWidth="0.2"
              strokeDasharray="0.8 0.6"
            />
            <circle
              cx={belt.x + belt.w / 2 + 0.5}
              cy={belt.y}
              r="0.8"
              fill="var(--signal)"
              stroke="var(--ink-0)"
              strokeWidth="0.3"
            />
          </g>
        )}

        {label &&
          zs.map((z) => {
            const lx = z.x > 50 ? 88 : 12;
            const anchor = z.x > 50 ? "start" : "end";
            return (
              <g key={z.id + "-lbl"}>
                <line
                  x1={z.x}
                  y1={z.y}
                  x2={lx}
                  y2={z.y}
                  stroke={COLOR_MAP[z.color]}
                  strokeWidth="0.15"
                  strokeDasharray="0.6 0.5"
                  opacity="0.6"
                />
                <text
                  x={lx}
                  y={z.y - 0.5}
                  textAnchor={anchor}
                  fontSize="2.4"
                  fontFamily="var(--mono)"
                  fill={COLOR_MAP[z.color]}
                  style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  {z.label}
                </text>
                <text x={lx} y={z.y + 2.2} textAnchor={anchor} fontSize="1.8" fontFamily="var(--mono)" fill="var(--fog-3)">
                  {z.sub}
                </text>
              </g>
            );
          })}

        <g transform="translate(3, 3)">
          <text
            x="0"
            y="2"
            fontSize="1.8"
            fontFamily="var(--mono)"
            fill="var(--fog-3)"
            style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            resonance map
          </text>
          <text x="0" y="5" fontSize="1.4" fontFamily="var(--mono)" fill="var(--fog-3)">
            {view} · t+14:22 · 40hz
          </text>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          display: "flex",
          gap: 0,
          background: "rgba(14,18,22,0.75)",
          backdropFilter: "blur(12px)",
          borderRadius: 999,
          padding: 3,
          border: "1px solid var(--ink-3)",
        }}
      >
        {(["back", "front"] as const).map((v) => (
          <div
            key={v}
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 10,
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              letterSpacing: 0.1,
              color: view === v ? "var(--ink-0)" : "var(--fog-2)",
              background: view === v ? "var(--signal)" : "transparent",
              cursor: "pointer",
            }}
          >
            {v}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(14,18,22,0.75)",
          backdropFilter: "blur(12px)",
          borderRadius: 8,
          padding: "6px 10px",
          border: "1px solid var(--ink-3)",
        }}
      >
        <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
          intensity
        </span>
        <div
          style={{
            width: 80,
            height: 6,
            borderRadius: 3,
            background:
              "linear-gradient(90deg, var(--cool), var(--spark), var(--flare))",
          }}
        />
      </div>
    </div>
  );
}
