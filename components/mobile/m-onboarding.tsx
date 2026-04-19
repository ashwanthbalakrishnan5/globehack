"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { MScreen } from "./shell";
import { TideMark } from "@/components/primitives";

const PERMS = [
  { label: "Heart rate", detail: "resting + variability", on: true },
  { label: "Sleep stages", detail: "14-day rolling window", on: true },
  { label: "Workouts", detail: "type, intensity, strain", on: true },
  { label: "Body metrics", detail: "weight, composition", on: false },
];

export function MOnboarding() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const clientId =
    process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "alina-zhou";

  const handleGrant = () => {
    if (leaving) return;
    setLeaving(true);
    fetch("/api/onboarding/health-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    }).catch(() => {
      /* background push, fail silently for demo */
    });
    setTimeout(() => router.push("/client/pair"), 240);
  };

  return (
    <MScreen pt={0} bg="var(--ink-0)">
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "54px 28px 0",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(212,244,90,0.14), transparent 60%), radial-gradient(90% 60% at 80% 20%, rgba(90,160,255,0.08), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <TideMark size={22} />
            <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>
              Tide · step 1 of 2
            </span>
          </div>
          <div style={{ position: "relative", marginTop: 36 }}>
            <div className="display-xl" style={{ color: "var(--fog-0)" }}>
              Your <em>signal</em>, ready to share.
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 14,
                color: "var(--fog-2)",
                lineHeight: 1.5,
                maxWidth: 300,
              }}
            >
              Connect Health to unlock the 14-day window your practitioner will see.
            </div>
          </div>
        </div>

        <motion.div
          initial={{ y: 420, opacity: 0 }}
          animate={{ y: leaving ? 420 : 0, opacity: leaving ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          style={{
            background: "var(--ink-1)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            border: "1px solid var(--ink-3)",
            borderBottom: "none",
            padding: "14px 24px 28px",
            boxShadow: "0 -30px 60px -20px rgba(0,0,0,0.55)",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: "var(--ink-4)",
              margin: "0 auto 16px",
            }}
          />
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.14 }}>
            Health Connect · permissions
          </div>
          <div style={{ fontSize: 17, color: "var(--fog-0)", marginTop: 6, fontWeight: 500 }}>
            Share fourteen days. Revoke in one tap.
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {PERMS.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--ink-2)",
                  borderRadius: 12,
                  border: "1px solid var(--ink-3)",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: p.on ? "var(--signal)" : "var(--ink-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: p.on ? "var(--signal-ink)" : "var(--fog-3)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {p.on ? "✓" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fog-0)" }}>{p.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 1 }}>
                    {p.detail}
                  </div>
                </div>
                <div
                  style={{
                    width: 32,
                    height: 18,
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
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: "#fff",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGrant}
            disabled={leaving}
            style={{
              marginTop: 18,
              width: "100%",
              height: 52,
              borderRadius: 14,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              boxShadow: "var(--glow-signal)",
              letterSpacing: -0.2,
              cursor: leaving ? "default" : "pointer",
              opacity: leaving ? 0.85 : 1,
            }}
          >
            {leaving ? "Connecting…" : "Grant Health Connect access"}
          </button>
          <div
            className="mono upper"
            style={{ fontSize: 9, color: "var(--fog-3)", textAlign: "center", marginTop: 10, letterSpacing: 0.14 }}
          >
            session-scoped · revocable · never central
          </div>
        </motion.div>
      </div>
    </MScreen>
  );
}
