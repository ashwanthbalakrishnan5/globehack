"use client";

import Link from "next/link";
import { MScreen } from "./shell";
import { Tag } from "@/components/primitives";

export function MSettings() {
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 24px 0" }}>
        <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>Your data</div>
        <div className="display-lg" style={{ marginTop: 6 }}>
          What Maya sees.
        </div>
        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 18,
            background:
              "radial-gradient(circle at 30% 0%, rgba(212,244,90,0.08), transparent 50%), var(--ink-2)",
            border: "1px solid var(--ink-3)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  "repeating-linear-gradient(-20deg, var(--ink-3), var(--ink-3) 4px, var(--ink-4) 4px, var(--ink-4) 5px)",
                border: "1px solid var(--ink-4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--fog-2)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              MR
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--fog-0)" }}>Maya Reyes, DPT</div>
              <div style={{ fontSize: 12, color: "var(--fog-2)", marginTop: 2 }}>
                paired 6 weeks ago · 7 sessions
              </div>
            </div>
            <Tag color="var(--signal)" variant="solid">Active</Tag>
          </div>
          <div style={{ height: 1, background: "var(--ink-3)", margin: "16px -18px 14px" }} />
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            sharing window
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span className="mono tnum" style={{ fontSize: 11, color: "var(--fog-2)" }}>14 days rolling</span>
            <span className="mono tnum" style={{ fontSize: 11, color: "var(--signal)" }}>
              Apr 3 → today
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--ink-3)",
              borderRadius: 999,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent, var(--signal) 70%, var(--signal))",
                width: "100%",
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 10, paddingLeft: 2 }}>
            Signals shared
          </div>
          <div
            style={{
              background: "var(--ink-2)",
              borderRadius: 16,
              border: "1px solid var(--ink-3)",
              overflow: "hidden",
            }}
          >
            {[
              { k: "Heart rate", v: "HRV, resting, workout", on: true },
              { k: "Sleep", v: "stages, duration", on: true },
              { k: "Workouts", v: "type, strain", on: true },
              { k: "Body", v: "weight, composition", on: false },
              { k: "Voice print", v: "paused when away", on: true },
            ].map((p, i, a) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: i < a.length - 1 ? "1px solid var(--ink-3)" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "var(--fog-0)" }}>{p.k}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
                    {p.v}
                  </div>
                </div>
                <div
                  style={{
                    width: 34,
                    height: 20,
                    borderRadius: 999,
                    background: p.on ? "var(--signal)" : "var(--ink-4)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: p.on ? 16 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <button
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              color: "var(--fog-0)",
              fontSize: 13,
              fontFamily: "var(--sans)",
              cursor: "pointer",
            }}
          >
            Download data
          </button>
          <Link
            href="/client"
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              background: "transparent",
              border: "1px solid var(--flare)",
              color: "var(--flare)",
              fontSize: 13,
              fontFamily: "var(--sans)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Revoke Maya
          </Link>
        </div>
        <div
          className="mono upper"
          style={{ fontSize: 9, color: "var(--fog-3)", textAlign: "center", marginTop: 24, paddingBottom: 32 }}
        >
          Data is session-scoped · no central store
        </div>
      </div>
    </MScreen>
  );
}
