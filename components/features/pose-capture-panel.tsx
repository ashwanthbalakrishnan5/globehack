"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MOVEMENTS, type Movement } from "./pose-capture";
import { usePoseStore, type PoseCapture } from "@/lib/pose-store";

const PoseCapture = dynamic(
  () => import("./pose-capture").then((m) => ({ default: m.PoseCapture })),
  {
    ssr: false,
    loading: () => (
      <div className="mono" style={{ fontSize: 11, color: "var(--fog-3)", padding: 12 }}>
        Loading camera…
      </div>
    ),
  }
);

interface Props {
  clientId: string;
  phase: "before" | "after";
  onSkip?: () => void;
}

export function PoseCapturePanel({ clientId, phase, onSkip }: Props) {
  const [active, setActive] = useState<Movement | null>(null);
  const setCapture = usePoseStore((s) => s.setCapture);
  const captures = usePoseStore((s) => s.captures);

  function getCapture(movementId: string): PoseCapture | null {
    return captures[`${clientId}:${phase}:${movementId}`] ?? null;
  }

  function handleCapture(data: PoseCapture) {
    setCapture(clientId, phase, data);
    setActive(null); // return to list after capture
  }

  // Camera view for selected movement
  if (active) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>
            Vision · {phase} · {active.label}
          </div>
          <button
            onClick={() => setActive(null)}
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "var(--fog-3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--mono)",
            }}
          >
            ← back
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{
                fontSize: 10,
                color: "var(--fog-3)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--mono)",
              }}
            >
              skip →
            </button>
          )}
        </div>
        <PoseCapture
          movement={active}
          label={phase === "before" ? "Before" : "After"}
          onCapture={handleCapture}
        />
      </div>
    );
  }

  // Movement list — always visible, shows status per movement
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)", marginBottom: 2 }}>
        Vision context · {phase} session ROM
      </div>
      {MOVEMENTS.map((m) => {
        const captured = getCapture(m.id);
        return (
          <button
            key={m.id}
            onClick={() => setActive(m)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: captured ? "rgba(34,197,94,0.06)" : "var(--ink-2)",
              border: captured ? "1px solid rgba(34,197,94,0.25)" : "1px solid var(--ink-3)",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--fog-0)", fontWeight: 600 }}>{m.label}</div>
              {captured ? (
                <div className="mono" style={{ fontSize: 9, color: "#4ade80", marginTop: 2 }}>
                  ✓ {captured.primary.value}{captured.primary.unit} · tap to retake
                </div>
              ) : (
                <div className="mono" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 2 }}>
                  {m.zone} · tap to capture
                </div>
              )}
            </div>
            <span style={{ fontSize: 10, color: captured ? "#4ade80" : "var(--fog-3)" }}>
              {captured ? "✓" : "→"}
            </span>
          </button>
        );
      })}
      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            marginTop: 2,
            padding: "6px 10px",
            borderRadius: 6,
            background: "none",
            border: "1px dashed var(--ink-3)",
            color: "var(--fog-3)",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: 0.12,
            textTransform: "uppercase",
          }}
        >
          skip posture check
        </button>
      )}
    </div>
  );
}
