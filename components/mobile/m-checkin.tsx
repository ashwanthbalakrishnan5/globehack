"use client";

import { motion } from "framer-motion";
import { MScreen } from "./shell";
import { TideMark, RingGauge } from "@/components/primitives";

export function MCheckIn() {
  const practitionerName =
    process.env.NEXT_PUBLIC_DEMO_PRACTITIONER_NAME ?? "Maya";

  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 28px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>Checking in</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--signal)" }}>● LIVE</span>
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="display-xl">Paired with {practitionerName}.</div>
          <div style={{ fontSize: 14, color: "var(--fog-2)", marginTop: 8 }}>Session #07 · Bay 3</div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          style={{
            marginTop: 36,
            aspectRatio: "1",
            background: "radial-gradient(circle at 50% 45%, rgba(212,244,90,0.18), rgba(7,9,12,0) 65%)",
            borderRadius: 28,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 999,
              border: "1px solid var(--signal)",
            }}
          />
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 999,
              border: "1px solid var(--signal)",
            }}
          />
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 32,
              background: "var(--signal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 40px 80px -20px rgba(212,244,90,0.5), 0 0 0 1px rgba(212,244,90,0.35)",
            }}
          >
            <TideMark size={64} color="var(--signal-ink)" />
          </div>
        </motion.div>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 16,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            Signals shared with {practitionerName}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <RingGauge size={42} pct={72} stroke={4} color="var(--hrv)" />
            <div style={{ flex: 1 }}>
              <div className="mono tnum" style={{ fontSize: 18, color: "var(--fog-0)" }}>
                72 <span style={{ fontSize: 10, color: "var(--fog-3)" }}>ms HRV</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>↓ 18% vs baseline</div>
            </div>
            <div style={{ width: 1, height: 30, background: "var(--ink-3)" }} />
            <div>
              <div className="mono tnum" style={{ fontSize: 18, color: "var(--fog-0)" }}>5h 42m</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>sleep · last night</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", textAlign: "center", paddingBottom: 32 }}>
          Session-scoped · revocable · never central
        </div>
      </div>
    </MScreen>
  );
}
