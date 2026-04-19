"use client";

/**
 * PoseComparison — shows before/after ROM snapshots with delta metrics.
 * Ported from CV/components/Comparison.jsx into TSX.
 */

import { useEffect, useState } from "react";
import type { PoseCapture } from "@/lib/pose-store";

function Ticker({ from, to, unit }: { from: number; to: number; unit: string }) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    let frame = 0;
    const steps = 40;
    const diff = to - from;
    const id = setInterval(() => {
      frame++;
      setVal(Math.round(from + (diff * frame) / steps));
      if (frame >= steps) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [from, to]);
  return <>{val}{unit}</>;
}

interface Props {
  before: PoseCapture;
  after: PoseCapture;
}

export function PoseComparison({ before, after }: Props) {
  const delta = after.primary.value - before.primary.value;
  const lowerIsBetter = before.primary.lowerIsBetter === true;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const absDelta = Math.abs(delta);

  return (
    <div
      style={{
        background: "var(--ink-2)",
        border: "1px solid var(--ink-3)",
        borderRadius: 12,
        padding: "14px",
        width: "100%",
      }}
    >
      <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
        ROM comparison · {before.movementLabel}
      </div>

      {/* Snapshots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--ink-3)",
            }}
          >
            <img src={before.snapshot} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>before</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--ink-3)",
            }}
          >
            <img src={after.snapshot} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>after</div>
        </div>
      </div>

      {/* Primary metric */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginBottom: 4 }}>
          {before.primary.label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--fog-0)" }}>
          <span style={{ color: "var(--fog-3)" }}>{before.primary.value}{before.primary.unit}</span>
          <span style={{ color: "var(--fog-3)", margin: "0 8px", fontSize: 14 }}>→</span>
          <span style={{ color: improved ? "#86efac" : "#fca5a5" }}>
            <Ticker from={before.primary.value} to={after.primary.value} unit={after.primary.unit} />
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            marginTop: 4,
            color: improved ? "#4ade80" : "#f87171",
          }}
        >
          {improved
            ? `+${absDelta}${before.primary.unit} improvement`
            : absDelta === 0
              ? "no change"
              : `${absDelta}${before.primary.unit} — no improvement`}
        </div>
      </div>

      {/* Secondary metric */}
      {before.secondary && after.secondary && (
        <div
          style={{
            borderTop: "1px solid var(--ink-3)",
            paddingTop: 8,
            textAlign: "center",
          }}
        >
          <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginBottom: 2 }}>
            {before.secondary.label}
          </div>
          <div style={{ fontSize: 13, color: "var(--fog-2)" }}>
            {before.secondary.value}{before.secondary.unit}
            <span style={{ color: "var(--fog-3)", margin: "0 6px" }}>→</span>
            <span style={{ color: "var(--fog-0)" }}>{after.secondary.value}{after.secondary.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}
