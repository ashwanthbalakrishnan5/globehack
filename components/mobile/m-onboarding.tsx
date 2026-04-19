"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MScreen } from "./shell";
import { LoadingButton, TideMark } from "@/components/primitives";

const PERMS = [
  { label: "Heart rate", detail: "resting + variability", on: true },
  { label: "Sleep stages", detail: "14-day rolling window", on: true },
  { label: "Workouts", detail: "type, intensity, strain", on: true },
  { label: "Body metrics", detail: "weight, composition", on: false },
];

export function MOnboarding() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [granted, setGranted] = useState(false);
  const clientId =
    process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "alina-zhou";

  const handleGrant = () => {
    startTransition(async () => {
      try {
        await fetch("/api/onboarding/health-connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        });
        setGranted(true);
        setTimeout(() => router.push("/client/pair"), 700);
      } catch (e) {
        console.error("Health Connect grant failed:", e);
      }
    });
  };

  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 28px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TideMark size={22} />
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>
            Tide · step 2 of 4
          </span>
        </div>
        <div style={{ marginTop: 40 }}>
          <div className="display-xl" style={{ color: "var(--fog-0)" }}>
            Share <em>fourteen days</em> of signal with your practitioner.
          </div>
          <div style={{ marginTop: 16, fontSize: 15, color: "var(--fog-2)", lineHeight: 1.5, maxWidth: 300 }}>
            A rolling window. Not stored. Not sold. Revoke in one tap.
          </div>
        </div>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 8 }}>
          {PERMS.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                background: "var(--ink-2)",
                borderRadius: 14,
                border: "1px solid var(--ink-3)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: p.on ? "var(--signal)" : "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: p.on ? "var(--signal-ink)" : "var(--fog-3)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {p.on ? "✓" : "○"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--fog-0)" }}>{p.label}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
                  {p.detail}
                </div>
              </div>
              <div
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 999,
                  background: p.on ? "var(--signal)" : "var(--ink-4)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: p.on ? 18 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: "#fff",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 0 32px" }}>
          <LoadingButton
            onClick={handleGrant}
            pending={pending}
            pendingLabel="Sending signals…"
            disabled={granted}
            spinnerSize={16}
            style={{
              width: "100%",
              height: 54,
              borderRadius: 14,
              background: granted ? "var(--signal-dim)" : "var(--signal)",
              color: "var(--signal-ink)",
              border: "none",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: "var(--glow-signal)",
              letterSpacing: -0.2,
            }}
          >
            {granted ? "Signals received ✓" : "Grant Health Connect access"}
          </LoadingButton>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", textAlign: "center", marginTop: 14 }}>
            Session-scoped · revocable · never central
          </div>
        </div>
      </div>
    </MScreen>
  );
}
