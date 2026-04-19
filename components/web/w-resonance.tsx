"use client";

import { Tag } from "@/components/primitives";
import { ResonanceMap } from "@/components/features/resonance-map";
import { WHeader, WShell } from "./shell";

export function WResonanceMap() {
  return (
    <WShell pageName="live">
      <WHeader
        title="Resonance Map · Marcus Rivera"
        sub="live · session 07 · t + 14:22 · 40Hz lymphatic"
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Tag color="var(--signal)" variant="solid">◉ live</Tag>
            <span className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
              belt · 94% contact
            </span>
          </div>
        }
      />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
        <div style={{ padding: 0, overflow: "hidden", position: "relative", background: "#0a0d12" }}>
          <ResonanceMap height={740} view="back" showBelt showRipple />
        </div>
        <div
          style={{
            borderLeft: "1px solid var(--ink-3)",
            padding: "22px 20px",
            overflow: "auto",
            background: "var(--ink-1)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 10 }}>
            where the data came from
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { s: "health connect", fields: "6 zones", o: "HRV, sleep, RHR, asymmetry" },
              { s: "session 1–6 notes", fields: "11 mentions", o: "L trap, low back, R hip" },
              { s: "hydrawav3 belt", fields: "240 Hz", o: "live EMG · contact · placement" },
              { s: "voice · this session", fields: "3 quotes", o: '"worse this week", "that spot"' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: "var(--ink-2)",
                  border: "1px solid var(--ink-3)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--fog-0)" }}>{s.s}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--signal)" }}>
                    {s.fields}
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 4 }}>
                  {s.o}
                </div>
              </div>
            ))}
          </div>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", margin: "20px 0 10px" }}>
            belt placement · auto-tuned
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "var(--ink-2)",
              border: "1px solid var(--signal)",
              boxShadow: "0 0 24px rgba(212,244,90,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, color: "var(--fog-0)", fontWeight: 500 }}>L4 – L5</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--signal)" }}>held 4:12</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 4, lineHeight: 1.5 }}>
              40Hz · 12 min remaining<br />
              pre-authorized by protocol 7
            </div>
          </div>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", margin: "20px 0 8px" }}>
            asymmetry · this session
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              ["L trap vs R", 4.2, "x"],
              ["L lat vs R", 1.3, "x"],
              ["L hip vs R", 1.1, "x"],
            ].map(([k, v, u], i) => {
              const numV = v as number;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fog-2)", width: 90 }}>
                    {k as string}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "var(--ink-3)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, numV * 20)}%`,
                        height: "100%",
                        background:
                          numV > 3 ? "var(--flare)" : numV > 1.5 ? "var(--spark)" : "var(--cool)",
                      }}
                    />
                  </div>
                  <span
                    className="mono tnum"
                    style={{ fontSize: 11, color: "var(--fog-0)", width: 32, textAlign: "right" }}
                  >
                    {numV}
                    {u as string}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WShell>
  );
}
