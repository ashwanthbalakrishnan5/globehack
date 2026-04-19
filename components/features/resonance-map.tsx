"use client";

import { CSSProperties, useState } from "react";
import dynamic from "next/dynamic";
import type { MarkedParts } from "./body-viewer";

const BodyViewer = dynamic(() => import("./body-viewer"), { ssr: false });

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
  bodyPartId?: string;
};

const DEFAULT_ZONES: Zone[] = [
  { id: "ltrap",     view: "back",  x: 38, y: 22, r: 11, intensity: 0.92, label: "L trap",       sub: "x4 sessions", color: "flare",  bodyPartId: "left_shoulder"  },
  { id: "rtrap",     view: "back",  x: 62, y: 22, r: 6,  intensity: 0.22, label: "R trap",       sub: "baseline",    color: "cool",   bodyPartId: "right_shoulder" },
  { id: "spine-mid", view: "back",  x: 50, y: 38, r: 7,  intensity: 0.45, label: "T6-T8",        sub: "guarded",     color: "spark",  bodyPartId: "chest"          },
  { id: "lowback",   view: "back",  x: 50, y: 58, r: 9,  intensity: 0.66, label: "L4-L5",        sub: "belt target", color: "spark",  bodyPartId: "lower_back"     },
  { id: "rhip",      view: "back",  x: 62, y: 70, r: 7,  intensity: 0.40, label: "R hip",        sub: "asymmetric",  color: "spark",  bodyPartId: "right_hip"      },
  { id: "hipflexR",  view: "front", x: 58, y: 64, r: 8,  intensity: 0.58, label: "R hip flexor", sub: "x2",          color: "spark",  bodyPartId: "right_thigh"    },
  { id: "jaw",       view: "front", x: 50, y: 10, r: 5,  intensity: 0.35, label: "jaw",          sub: "bracing",     color: "cool",   bodyPartId: "head"           },
  { id: "chest",     view: "front", x: 50, y: 28, r: 6,  intensity: 0.30, label: "sternum",      sub: "shallow",     color: "cool",   bodyPartId: "chest"          },
];

const ZONE_COLOR_TO_STATUS: Record<ZoneColor, "pain" | "active" | "recovered"> = {
  flare:  "pain",
  spark:  "active",
  cool:   "recovered",
  signal: "active",
};

function zonesToMarkedParts(zones: Zone[]): MarkedParts {
  const parts: MarkedParts = {};
  zones.forEach((z) => {
    if (z.bodyPartId) {
      const existing = parts[z.bodyPartId];
      const next = ZONE_COLOR_TO_STATUS[z.color];
      if (!existing || (next === "pain")) {
        parts[z.bodyPartId] = next;
      }
    }
  });
  return parts;
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
  const [activeView, setActiveView] = useState<"front" | "back">(view);
  const allZones = zones ?? DEFAULT_ZONES;
  const markedParts = zonesToMarkedParts(allZones);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        ...style,
      }}
    >
      <BodyViewer markedParts={markedParts} background="#0a0d12" />

      {label && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            pointerEvents: "none",
          }}
        >
          <div
            className="mono upper"
            style={{ fontSize: 9, color: "var(--fog-3)", letterSpacing: "0.1em" }}
          >
            resonance map
          </div>
          <div className="mono" style={{ fontSize: 8, color: "var(--fog-3)" }}>
            {activeView} · t+14:22 · 40hz
          </div>
        </div>
      )}

      {label && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            pointerEvents: "none",
          }}
        >
          {allZones.filter((z) => z.view === activeView).map((z) => (
            <div
              key={z.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(10,13,18,0.75)",
                backdropFilter: "blur(8px)",
                borderRadius: 6,
                padding: "3px 8px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    z.color === "flare"
                      ? "var(--flare)"
                      : z.color === "spark"
                      ? "var(--spark)"
                      : "var(--cool)",
                  flexShrink: 0,
                }}
              />
              <span className="mono upper" style={{ fontSize: 8, color: "var(--fog-2)" }}>
                {z.label}
              </span>
              <span className="mono" style={{ fontSize: 8, color: "var(--fog-3)" }}>
                {z.sub}
              </span>
            </div>
          ))}
        </div>
      )}

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
          <button
            key={v}
            onClick={() => setActiveView(v)}
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 10,
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              letterSpacing: 0.1,
              color: activeView === v ? "var(--ink-0)" : "var(--fog-2)",
              background: activeView === v ? "var(--signal)" : "transparent",
              cursor: "pointer",
              border: "none",
            }}
          >
            {v}
          </button>
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
            background: "linear-gradient(90deg, var(--cool), var(--spark), var(--flare))",
          }}
        />
      </div>
    </div>
  );
}
