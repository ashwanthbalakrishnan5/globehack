"use client";

import Link from "next/link";
import { MScreen } from "./shell";

export function MSessionLive() {
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>◉ Session live</div>
            <div className="mono tnum" style={{ fontSize: 28, color: "var(--fog-0)", marginTop: 2, fontWeight: 300 }}>
              12:47
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>Protocol</div>
            <div style={{ fontSize: 14, color: "var(--fog-0)", marginTop: 2 }}>Parasympathetic</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>40Hz · cool</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            height: 260,
            borderRadius: 24,
            background:
              "radial-gradient(circle at 50% 60%, rgba(212,244,90,0.18), transparent 65%), var(--ink-1)",
            border: "1px solid var(--ink-3)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 120 + i * 60,
                height: 120 + i * 60,
                borderRadius: "50%",
                border: "1px solid var(--signal)",
                opacity: 0.2 - i * 0.04,
                animation: `breathe ${4 + i}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--signal), var(--signal-dim))",
              boxShadow: "0 0 60px rgba(212,244,90,0.6)",
              animation: "breathe 5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 20,
              right: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)" }}>84</div>
              <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>BPM · now</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono tnum" style={{ fontSize: 22, color: "var(--signal)" }}>↓ 11</div>
              <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>since start</div>
            </div>
          </div>
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
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1px solid var(--signal)",
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--signal)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--fog-0)" }}>Listening in the background</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
              On-device · transcribed in real time
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingBottom: 32 }}>
          <Link
            href="/client/summary"
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              background: "transparent",
              color: "var(--fog-0)",
              border: "1px solid var(--ink-4)",
              fontSize: 15,
              fontFamily: "var(--sans)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            End session
          </Link>
        </div>
      </div>
    </MScreen>
  );
}
