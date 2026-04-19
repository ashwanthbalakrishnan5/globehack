"use client";

import { Tag } from "@/components/primitives";
import { CoherenceRing } from "@/components/features/coherence-ring";
import { WHeader, WShell } from "./shell";

export function WCoherence() {
  return (
    <WShell pageName="live">
      <WHeader
        title="Between-session practice"
        sub="Marcus's last 7 days of guided breathwork"
        right={<Tag color="var(--signal)" variant="solid">4 of 5 days hit</Tag>}
      />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
        <div
          style={{
            padding: "28px 32px",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
            today · 4 minutes ago · real breath · real mic
          </div>
          <CoherenceRing size={380} />
          <div
            style={{
              maxWidth: 420,
              textAlign: "center",
              fontSize: 15,
              color: "var(--fog-2)",
              lineHeight: 1.5,
            }}
          >
            Marcus practiced for 4 minutes before bed. Coherence stabilised at{" "}
            <span style={{ color: "var(--signal)" }}>78</span> &mdash; his highest this month.
          </div>
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
            7-day coherence trend
          </div>
          {["apr 12", "apr 13", "apr 14", "apr 15", "apr 16", "apr 17", "today"].map((d, i) => {
            const vals = [52, 60, 58, 66, 71, 68, 78];
            const v = vals[i];
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)", width: 54 }}>
                  {d}
                </span>
                <div style={{ flex: 1, height: 6, background: "var(--ink-3)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${v}%`,
                      height: "100%",
                      borderRadius: 3,
                      background:
                        v >= 70 ? "var(--signal)" : v >= 55 ? "var(--spark)" : "var(--cool)",
                    }}
                  />
                </div>
                <span
                  className="mono tnum"
                  style={{ fontSize: 11, color: "var(--fog-0)", width: 22, textAlign: "right" }}
                >
                  {v}
                </span>
              </div>
            );
          })}
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", margin: "22px 0 10px" }}>
            clinical effect
          </div>
          <div
            style={{
              padding: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              borderRadius: 10,
            }}
          >
            <div className="mono tnum" style={{ fontSize: 24, color: "var(--signal)", fontWeight: 300 }}>
              +24%
            </div>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 4 }}>
              HRV lift sustained through next session
            </div>
          </div>
        </div>
      </div>
    </WShell>
  );
}
