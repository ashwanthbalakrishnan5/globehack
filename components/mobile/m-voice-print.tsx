"use client";

import Link from "next/link";
import { MScreen } from "./shell";
import { VoiceWave } from "@/components/primitives";

export function MVoicePrint() {
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 28px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>Voice print · one-time</div>
        <div style={{ marginTop: 20 }}>
          <div className="display-lg">Read this aloud, naturally.</div>
        </div>
        <div
          style={{
            marginTop: 32,
            padding: 24,
            borderRadius: 20,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            position: "relative",
          }}
        >
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.35, color: "var(--fog-0)" }}>
            <span style={{ background: "rgba(212,244,90,0.2)", padding: "2px 2px", borderRadius: 2 }}>
              Seven silver swans swam softly
            </span>{" "}
            <span style={{ color: "var(--fog-3)" }}>across the quiet harbor while waves traced the shore.</span>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -10,
              left: 24,
              background: "var(--ink-3)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            <span className="mono tnum" style={{ fontSize: 10, color: "var(--signal)" }}>◉ REC · 4s / 10s</span>
          </div>
        </div>
        <div style={{ marginTop: 48, padding: "0 8px" }}>
          <VoiceWave color="var(--signal)" bars={40} />
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div className="mono tnum" style={{ fontSize: 11, color: "var(--signal)" }}>◉ 62 dB</div>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 2 }}>input</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono tnum" style={{ fontSize: 11, color: "var(--fog-0)" }}>94%</div>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 2 }}>clarity</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 40 }}>
          <Link
            href="/client"
            aria-label="Save voice print and continue"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "var(--ink-2)",
              border: "2px solid var(--signal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: "50%",
                border: "2px solid var(--signal)",
                opacity: 0.4,
                animation: "pulse-ring 1.8s ease-out infinite",
              }}
            />
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--signal)" }} />
          </Link>
        </div>
      </div>
    </MScreen>
  );
}
