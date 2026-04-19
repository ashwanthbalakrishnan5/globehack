"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MScreen } from "./shell";
import { Tag } from "@/components/primitives";

const INITIAL_PERMS = [
  { k: "Heart rate", v: "HRV, resting, workout", on: true },
  { k: "Sleep", v: "stages, duration", on: true },
  { k: "Workouts", v: "type, strain", on: true },
  { k: "Body", v: "weight, composition", on: false },
];

export function MSettings() {
  const [perms, setPerms] = useState(INITIAL_PERMS);
  const [toast, setToast] = useState<string | null>(null);
  const clientId =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "alina-zhou"
      : "alina-zhou";

  const enabledRequired = perms.filter((p, i) => i !== 3);
  const sharingEnabled = enabledRequired.every((p) => p.on);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const togglePerm = async (i: number) => {
    const next = perms.map((p, idx) => (idx === i ? { ...p, on: !p.on } : p));
    setPerms(next);
    const nextEnabled = next.filter((_, idx) => idx !== 3).every((p) => p.on);
    try {
      await fetch("/api/client/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, sharingEnabled: nextEnabled }),
      });
      setToast(nextEnabled ? "Sharing resumed" : `${next[i].k} paused`);
    } catch (e) {
      console.error("privacy toggle failed", e);
    }
  };

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
            <Tag
              color={sharingEnabled ? "var(--signal)" : "var(--flare)"}
              variant="solid"
            >
              {sharingEnabled ? "Active" : "Paused"}
            </Tag>
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
            <span className="mono tnum" style={{ fontSize: 11, color: sharingEnabled ? "var(--signal)" : "var(--flare)" }}>
              {sharingEnabled ? "Apr 3 → today" : "paused"}
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
            <motion.div
              animate={{ width: sharingEnabled ? "100%" : "0%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent, var(--signal) 70%, var(--signal))",
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
            {perms.map((p, i, a) => (
              <button
                key={i}
                type="button"
                onClick={() => togglePerm(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "14px 16px",
                  borderBottom: i < a.length - 1 ? "1px solid var(--ink-3)" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "var(--fog-0)" }}>{p.k}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
                    {p.v}
                  </div>
                </div>
                <motion.div
                  animate={{ background: p.on ? "var(--signal)" : "var(--ink-4)" }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 34,
                    height: 20,
                    borderRadius: 999,
                    position: "relative",
                  }}
                >
                  <motion.div
                    animate={{ left: p.on ? 16 : 2 }}
                    transition={{ type: "spring", stiffness: 520, damping: 30 }}
                    style={{
                      position: "absolute",
                      top: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                </motion.div>
              </button>
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
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            style={{
              position: "fixed",
              left: 24,
              right: 24,
              bottom: 24,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-3)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
              textAlign: "center",
              color: "var(--fog-0)",
              fontSize: 13,
              fontFamily: "var(--sans)",
              zIndex: 50,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </MScreen>
  );
}
