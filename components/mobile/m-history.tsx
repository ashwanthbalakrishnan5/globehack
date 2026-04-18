"use client";

import { MScreen } from "./shell";
import { HRVSpark, Tag } from "@/components/primitives";

export function MHistory() {
  const sessions = [
    { n: "07", date: "today", tag: '"left trap is worse"', hrv: "+18", dur: "38m", flare: true },
    { n: "06", date: "apr 10", tag: '"hip feels locked"', hrv: "+12", dur: "42m" },
    { n: "05", date: "apr 03", tag: '"slept great"', hrv: "+7", dur: "38m" },
    { n: "04", date: "mar 27", tag: '"low back tight"', hrv: "+9", dur: "45m" },
    { n: "03", date: "mar 20", tag: '"travel week"', hrv: "+4", dur: "30m" },
  ];
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 24px 0" }}>
        <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>History</div>
        <div className="display-lg" style={{ marginTop: 6 }}>
          Seven sessions with Maya
        </div>
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div className="mono tnum" style={{ fontSize: 26, color: "var(--signal)", fontWeight: 300 }}>
              +74<span style={{ fontSize: 12, color: "var(--fog-3)" }}>&nbsp;ms</span>
            </div>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
              cumulative hrv lift
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: "var(--ink-3)" }} />
          <HRVSpark data={[42, 49, 56, 61, 58, 65, 72]} width={120} height={40} color="var(--signal)" />
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column" }}>
          {sessions.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 4px",
                borderBottom: i < sessions.length - 1 ? "1px solid var(--ink-3)" : "none",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: i === 0 ? "var(--signal)" : "var(--ink-2)",
                  border: i === 0 ? "none" : "1px solid var(--ink-3)",
                  color: i === 0 ? "var(--signal-ink)" : "var(--fog-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--mono)",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {s.n}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="serif"
                  style={{
                    fontSize: 16,
                    color: "var(--fog-0)",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.tag}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                  <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>{s.date}</span>
                  <span className="mono tnum" style={{ fontSize: 9, color: "var(--signal)" }}>hrv {s.hrv}</span>
                  <span className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>{s.dur}</span>
                </div>
              </div>
              {s.flare && <Tag color="var(--signal)">new</Tag>}
            </div>
          ))}
        </div>
      </div>
    </MScreen>
  );
}
