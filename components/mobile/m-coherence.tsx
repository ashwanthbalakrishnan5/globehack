"use client";

import { MScreen } from "./shell";
import { Tag } from "@/components/primitives";
import { CoherenceRing } from "@/components/features/coherence-ring";

export function MCoherence() {
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>Tonight · 4 min</div>
          <Tag color="var(--signal)" variant="solid">day 5 of 7</Tag>
        </div>
        <div className="display-md" style={{ marginTop: 10, color: "var(--fog-0)" }}>
          Breathe with Maya&rsquo;s<br />
          <em>protocol 7</em>.
        </div>
      </div>

      <div style={{ margin: "20px 0", display: "flex", justifyContent: "center", position: "relative" }}>
        <CoherenceRing size={300} />
      </div>

      <div style={{ padding: "0 24px" }}>
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 8 }}>
            what Maya sees at your next visit
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              ["78", "coherence", "peak"],
              ["+24%", "HRV lift", "sustained"],
              ["4 / 5", "days hit", "this week"],
            ].map(([v, l, s], i) => (
              <div key={i} style={{ padding: 8, borderRadius: 8, background: "var(--ink-3)" }}>
                <div className="mono tnum" style={{ fontSize: 18, color: "var(--signal)", fontWeight: 300 }}>
                  {v}
                </div>
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginTop: 2 }}>
                  {l}
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--fog-2)", marginTop: 1 }}>
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            last seven days
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64 }}>
            {[52, 60, 58, 66, 71, 68, 78].map((v, i, a) => {
              const isToday = i === a.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${v * 0.7}%`,
                      borderRadius: 4,
                      background: isToday
                        ? "var(--signal)"
                        : v >= 70
                        ? "rgba(212,244,90,0.5)"
                        : v >= 55
                        ? "rgba(212,244,90,0.25)"
                        : "var(--ink-3)",
                    }}
                  />
                  <div
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: isToday ? "var(--signal)" : "var(--fog-3)",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {["m", "t", "w", "t", "f", "s", "s"][i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          style={{
            marginTop: 20,
            width: "100%",
            height: 52,
            borderRadius: 12,
            background: "var(--signal)",
            color: "var(--ink-0)",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--sans)",
            letterSpacing: -0.01,
            cursor: "pointer",
          }}
        >
          Continue · 12 min to go
        </button>
        <div
          className="mono upper"
          style={{ fontSize: 9, color: "var(--fog-3)", textAlign: "center", marginTop: 14, paddingBottom: 28 }}
        >
          mic · private · nothing sent until you finish
        </div>
      </div>
    </MScreen>
  );
}
