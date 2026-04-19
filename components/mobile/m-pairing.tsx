"use client";

import Link from "next/link";
import { MScreen } from "./shell";
import { TideMark, Tag } from "@/components/primitives";

export function MPairing() {
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 28px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TideMark size={22} />
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>
            Tide · step 2 of 2
          </span>
        </div>
        <div style={{ marginTop: 36 }}>
          <div className="display-lg" style={{ color: "var(--fog-0)" }}>
            Pair with a practitioner
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            padding: 20,
            borderRadius: 20,
            background: "linear-gradient(180deg, var(--ink-2), var(--ink-1))",
            border: "1px solid var(--ink-3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, opacity: 0.12 }}>
            <TideMark size={160} animate={false} color="var(--signal)" />
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background:
                  "repeating-linear-gradient(-20deg, var(--ink-3), var(--ink-3) 4px, var(--ink-4) 4px, var(--ink-4) 5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--fog-2)",
                fontSize: 22,
                fontWeight: 500,
                border: "1px solid var(--ink-4)",
              }}
            >
              MR
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--fog-0)" }}>Maya Reyes, DPT</div>
              <div style={{ fontSize: 13, color: "var(--fog-2)", marginTop: 2 }}>Stillwater Recovery · Austin</div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <Tag color="var(--signal)">Hydrawav3 certified</Tag>
                <Tag color="var(--fog-3)">4.2 mi</Tag>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 10 }}>
            This practitioner will see
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { k: "HRV, resting HR, sleep", v: "last 14 days" },
              { k: "Workout strain", v: "since last visit" },
              { k: "Mobility history", v: "from prior sessions" },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < 2 ? "1px solid var(--ink-3)" : "none",
                }}
              >
                <span style={{ fontSize: 14, color: "var(--fog-0)" }}>{r.k}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fog-3)" }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 0 32px" }}>
          <Link
            href="/client"
            style={{
              width: "100%",
              height: 54,
              borderRadius: 14,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              boxShadow: "var(--glow-signal)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Pair with Maya
          </Link>
          <Link
            href="/client"
            style={{
              width: "100%",
              height: 44,
              marginTop: 8,
              background: "transparent",
              color: "var(--fog-2)",
              fontSize: 14,
              fontFamily: "var(--sans)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Scan a different code
          </Link>
        </div>
      </div>
    </MScreen>
  );
}
