"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BioGrid, LoadingButton, Tag, TideMark } from "@/components/primitives";
import { useSession } from "@/lib/store";
import { WHeader, WShell } from "./shell";

type NoteState = "keep" | "drop";

export function WNotesReview() {
  const router = useRouter();
  const fireSummary = useSession((s) => s.fireSummary);
  const [firing, startFire] = useTransition();
  const notes = useMemo(
    () => [
      {
        type: "complaint",
        quote: "Honestly, it's worse than last week.",
        ref: "minute 0:14",
        fields: [
          { k: "body part", v: "left trap" },
          { k: "intensity", v: "↑ vs prior" },
          { k: "pattern", v: "sleeping side" },
        ],
      },
      {
        type: "preference",
        quote: "Can you do that spot again? The one from last time.",
        ref: "minute 14:02",
        fields: [{ k: "action", v: "repeat L4 belt placement" }],
      },
      {
        type: "self-report",
        quote: "Resting heart rate has been way up since the race.",
        ref: "minute 18:40",
        fields: [
          { k: "signal", v: "elevated RHR" },
          { k: "context", v: "post-race, 9 days" },
        ],
      },
    ],
    []
  );
  const [states, setStates] = useState<NoteState[]>(() => notes.map(() => "keep"));
  const setState = (i: number, s: NoteState) =>
    setStates((prev) => prev.map((v, idx) => (idx === i ? s : v)));
  const discardAll = () => setStates(notes.map(() => "drop"));

  const onFire = () => {
    startFire(async () => {
      await new Promise((r) => setTimeout(r, 500));
      fireSummary();
      router.push("/practitioner");
    });
  };
  return (
    <WShell pageName="notes">
      <WHeader
        title="Review · Marcus Rivera"
        sub="session 07 · 38m · just ended"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={discardAll}
              type="button"
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 10,
                background: "var(--ink-2)",
                color: "var(--fog-0)",
                border: "1px solid var(--ink-3)",
                fontSize: 12,
                fontFamily: "var(--sans)",
                cursor: "pointer",
              }}
            >
              Discard all
            </button>
            <LoadingButton
              onClick={onFire}
              pending={firing}
              pendingLabel="Firing summary…"
              spinnerSize={12}
              style={{
                height: 38,
                padding: "0 18px",
                borderRadius: 10,
                background: "var(--signal)",
                color: "var(--signal-ink)",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Save &amp; fire summary card
            </LoadingButton>
          </div>
        }
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 420px", overflow: "hidden" }}>
        <div style={{ padding: "22px 28px", overflow: "auto" }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 10 }}>
            extracted · 3 items · ~20s to review
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence initial={false}>
            {notes.map((n, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 1 }}
                animate={{ opacity: states[i] === "drop" ? 0.38 : 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: "var(--ink-2)",
                  border: `1px solid ${states[i] === "drop" ? "var(--ink-3)" : "var(--ink-3)"}`,
                  borderLeft: states[i] === "drop" ? "2px solid var(--ink-4)" : "2px solid var(--signal)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Tag color="var(--signal)">{n.type}</Tag>
                  <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>{n.ref}</span>
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 18, fontStyle: "italic", color: "var(--fog-0)", lineHeight: 1.3 }}
                >
                  &ldquo;{n.quote}&rdquo;
                </div>
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--ink-1)",
                    border: "1px solid var(--ink-3)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {n.fields.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 14 }}>
                      <span
                        className="mono upper"
                        style={{ fontSize: 9, color: "var(--fog-3)", width: 78 }}
                      >
                        {f.k}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--fog-0)", flex: 1 }}>{f.v}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>edit</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setState(i, "keep")}
                    aria-pressed={states[i] === "keep"}
                    style={{
                      height: 28,
                      padding: "0 12px",
                      borderRadius: 6,
                      background: states[i] === "keep" ? "var(--signal)" : "var(--ink-3)",
                      color: states[i] === "keep" ? "var(--signal-ink)" : "var(--fog-0)",
                      border: "none",
                      fontSize: 11,
                      fontFamily: "var(--sans)",
                      cursor: "pointer",
                      fontWeight: states[i] === "keep" ? 600 : 400,
                    }}
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={() => setState(i, "drop")}
                    aria-pressed={states[i] === "drop"}
                    style={{
                      height: 28,
                      padding: "0 12px",
                      borderRadius: 6,
                      background: states[i] === "drop" ? "var(--ink-3)" : "transparent",
                      color: states[i] === "drop" ? "var(--fog-0)" : "var(--fog-3)",
                      border: "1px solid var(--ink-3)",
                      fontSize: 11,
                      fontFamily: "var(--sans)",
                      cursor: "pointer",
                    }}
                  >
                    Drop
                  </button>
                  <span style={{ flex: 1 }} />
                  <span
                    className="mono"
                    style={{ fontSize: 9, color: "var(--fog-3)", alignSelf: "center" }}
                  >
                    {states[i] === "drop"
                      ? "will not be saved"
                      : "→ client profile · tagged “session 07”"}
                  </span>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>

        <div
          style={{
            borderLeft: "1px solid var(--ink-3)",
            padding: "22px 20px",
            overflow: "auto",
            background: "var(--ink-1)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 12 }}>
            card Marcus will see
          </div>
          <div
            style={{
              borderRadius: 18,
              padding: 18,
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(50,70,34,0.9), rgba(20,28,14,0.95))",
              border: "1px solid rgba(212,244,90,0.2)",
            }}
          >
            <BioGrid color="rgba(212,244,90,0.08)" size={18} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
              <TideMark size={16} color="var(--signal)" animate={false} />
              <span className="mono upper" style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>
                Tide · session 07
              </span>
            </div>
            <div
              className="serif"
              style={{
                marginTop: 14,
                fontSize: 22,
                fontStyle: "italic",
                color: "#fff",
                lineHeight: 1.25,
              }}
            >
              &ldquo;Left trap is <span style={{ color: "var(--signal)" }}>worse</span> this week.&rdquo;
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "14px 0" }} />
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="mono tnum" style={{ fontSize: 20, color: "#fff" }}>
                  <span style={{ color: "var(--signal)" }}>↓</span>11
                  <span style={{ fontSize: 11, opacity: 0.5 }}>&nbsp;bpm</span>
                </div>
                <div className="mono upper" style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  in 42 minutes
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="mono tnum" style={{ fontSize: 20, color: "#fff" }}>
                  <span style={{ color: "var(--signal)" }}>+</span>18
                  <span style={{ fontSize: 11, opacity: 0.5 }}>&nbsp;ms</span>
                </div>
                <div className="mono upper" style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  HRV shift
                </div>
              </div>
            </div>
          </div>

          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", margin: "20px 0 8px" }}>
            quote to feature
          </div>
          <div
            style={{
              padding: 10,
              borderRadius: 8,
              background: "var(--ink-2)",
              border: "1px solid var(--signal)",
              fontSize: 12,
              color: "var(--fog-0)",
              fontStyle: "italic",
              fontFamily: "var(--serif)",
            }}
          >
            &ldquo;Left trap is worse this week.&rdquo;{" "}
            <span style={{ color: "var(--signal)", float: "right" }}>✓</span>
          </div>
          <div
            style={{
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--ink-3)",
              fontSize: 12,
              color: "var(--fog-3)",
              fontStyle: "italic",
              fontFamily: "var(--serif)",
            }}
          >
            &ldquo;Can you do that spot again?&rdquo;
          </div>
          <div
            style={{
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--ink-3)",
              fontSize: 12,
              color: "var(--fog-3)",
              fontStyle: "italic",
              fontFamily: "var(--serif)",
            }}
          >
            &ldquo;Heart rate up since the race.&rdquo;
          </div>
        </div>
      </div>
    </WShell>
  );
}
