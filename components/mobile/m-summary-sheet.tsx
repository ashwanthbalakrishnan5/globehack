"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MScreen } from "./shell";
import { Meter } from "@/components/primitives";
import type { SummaryCard } from "@/lib/types";

interface Props {
  card: SummaryCard | null;
  onClose: () => void;
}

export function MSummarySheet({ card, onClose }: Props) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key="summary-sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "var(--ink-0)",
          }}
        >
          <MScreen pt={54}>
            <div style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={onClose}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--ink-2)",
                    border: "1px solid var(--ink-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--fog-2)",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
                <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                  Session summary · Today
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--signal)",
                    color: "var(--signal-ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  ↗
                </div>
              </div>

              {card.quote && (
                <div style={{ marginTop: 36, textAlign: "center", padding: "0 8px" }}>
                  <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 16 }}>
                    ── you said ──
                  </div>
                  <div
                    className="serif"
                    style={{
                      fontSize: 28,
                      lineHeight: 1.2,
                      color: "var(--fog-0)",
                      fontStyle: "italic",
                      letterSpacing: -0.01,
                    }}
                  >
                    &ldquo;{card.quote}&rdquo;
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "center", marginTop: 20, marginBottom: 8 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(212,244,90,0.4), transparent)",
                    filter: "blur(8px)",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: 18,
                  borderRadius: 18,
                  background: "var(--ink-2)",
                  border: "1px solid var(--ink-3)",
                }}
              >
                <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
                  {card.headline}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--fog-1)", lineHeight: 1.5 }}>
                  {card.protocol_used}
                </div>
                {card.key_notes.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {card.key_notes.map((n, i) => (
                      <div key={i} style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 4 }}>
                        · {n}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)", fontWeight: 300 }}>
                      {card.duration_min}<span style={{ fontSize: 13, color: "var(--fog-3)" }}>&nbsp;min</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 2 }}>Duration</div>
                    <Meter pct={Math.round((card.duration_min / 60) * 100)} color="var(--signal)" delay={0.2} />
                  </div>
                  <div>
                    <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)", fontWeight: 300 }}>
                      {card.hrv_at_session}<span style={{ fontSize: 13, color: "var(--fog-3)" }}>&nbsp;ms</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 2 }}>HRV at session</div>
                    <Meter pct={Math.round((card.hrv_at_session / 100) * 100)} color="var(--signal)" delay={0.4} />
                  </div>
                </div>
              </div>

              {card.next_steps && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(212,244,90,0.06)",
                    border: "1px solid rgba(212,244,90,0.2)",
                    fontSize: 12,
                    color: "var(--fog-1)",
                    lineHeight: 1.5,
                  }}
                >
                  <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>next: </span>
                  {card.next_steps}
                </div>
              )}

              <div style={{ flex: 1 }} />
              <div style={{ paddingBottom: 32, display: "flex", gap: 8 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 14,
                    background: "var(--signal)",
                    color: "var(--signal-ink)",
                    border: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "var(--sans)",
                    boxShadow: "var(--glow-signal)",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </MScreen>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
