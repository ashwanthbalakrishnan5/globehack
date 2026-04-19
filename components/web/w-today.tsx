"use client";

import { useState } from "react";
import { StatBlock, WHeader, WShell } from "./shell";
import { RingGauge, Tag, WavePath } from "@/components/primitives";
import { WCheckinQR } from "./w-checkin-qr";
import { WClientCheckinModal } from "./w-client-checkin-modal";
import type { Slot, Flag } from "@/lib/types";

const FALLBACK_SLOTS = [
  { t: "9:00", id: "sarah-chen", name: "Sarah Chen", tag: "returning · 4th", readiness: 82, protocol: "Standard Balance", state: "done" as const, flag: false },
  { t: "10:15", id: "marcus-rivera", name: "Marcus Rivera", tag: "returning · 7th", readiness: 54, protocol: "Parasympathetic · 40Hz", state: "done" as const, flag: false },
  { t: "11:30", id: "alina-zhou", name: "Alina Zhou", tag: "new · first", readiness: 72, protocol: "Baseline · onboarding", state: "now" as const, flag: true },
  { t: "2:00", id: "priya-shah", name: "Priya Shah", tag: "returning · 2nd", readiness: 81, protocol: "Mobility · asymmetry", state: "soon" as const, flag: false },
  { t: "3:30", id: "sarah-chen", name: "Sarah Chen", tag: "returning · 5th", readiness: 68, protocol: "Recovery · cool", state: "soon" as const, flag: false },
  { t: "5:00", id: "lee-tran", name: "Lee Tran", tag: "returning · 3rd", readiness: 67, protocol: "Standard", state: "soon" as const, flag: false },
];

export function WToday({ liveSlots, liveFlags }: { liveSlots?: Slot[]; liveFlags?: Flag[] }) {
  const merged = liveSlots && liveSlots.length > 0
    ? FALLBACK_SLOTS.map((s) => {
        const live = liveSlots.find((l) => l.clientId === s.id);
        if (!live) return s;
        return { ...s, name: live.clientName, tag: live.tag, readiness: live.readiness, protocol: live.protocol, state: live.state };
      })
    : FALLBACK_SLOTS;
  const slots = merged;
  const [pairing, setPairing] = useState<{ id: string; name: string } | null>(null);

  return (
    <WShell pageName="today">
      <WHeader
        title="Thursday, April 17"
        sub="Today · Stillwater Recovery"
        right={
          <div style={{ display: "flex", gap: 24 }}>
            <StatBlock value="6" label="sessions" trend="+1 vs avg" />
            <StatBlock value="$1,120" label="projected" color="var(--signal)" />
            <StatBlock value="68%" label="rebook rate" color="var(--signal)" trend="+22 pts" />
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 0, flex: 1, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", overflow: "auto" }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 14 }}>
            schedule · 6 clients
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {slots.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPairing({ id: s.id, name: s.name })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background:
                    s.state === "now"
                      ? "linear-gradient(90deg, rgba(212,244,90,0.1), var(--ink-2))"
                      : "var(--ink-2)",
                  border: s.state === "now" ? "1px solid var(--signal)" : "1px solid var(--ink-3)",
                  opacity: s.state === "done" ? 0.55 : 1,
                  position: "relative",
                  textAlign: "left",
                  color: "inherit",
                  cursor: "pointer",
                  font: "inherit",
                  width: "100%",
                }}
              >
                <div style={{ width: 58 }}>
                  <div className="mono tnum" style={{ fontSize: 18, color: "var(--fog-0)" }}>{s.t}</div>
                  <div
                    className="mono upper"
                    style={{
                      fontSize: 8,
                      color: s.state === "now" ? "var(--signal)" : "var(--fog-3)",
                      marginTop: 2,
                    }}
                  >
                    {s.state === "done" ? "✓ done" : s.state === "now" ? "● now" : "soon"}
                  </div>
                </div>
                <div style={{ width: 1, height: 34, background: "var(--ink-3)" }} />
                <RingGauge
                  size={44}
                  pct={s.readiness}
                  stroke={4}
                  color={
                    s.readiness >= 75
                      ? "var(--signal)"
                      : s.readiness >= 55
                      ? "var(--spark)"
                      : "var(--flare)"
                  }
                  value={s.readiness}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, color: "var(--fog-0)", fontWeight: 500 }}>{s.name}</span>
                    {s.flag && <Tag color="var(--signal)">new</Tag>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 3 }}>
                    {s.tag}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>protocol</div>
                  <div style={{ fontSize: 12, color: "var(--fog-0)", marginTop: 2 }}>{s.protocol}</div>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "var(--ink-3)",
                    color: "var(--fog-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  →
                </div>
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            borderLeft: "1px solid var(--ink-3)",
            padding: "20px 20px",
            overflow: "auto",
            background: "var(--ink-1)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <WCheckinQR />
          </div>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 14 }}>
            Day pulse
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>avg client HRV</span>
              <span className="mono tnum" style={{ fontSize: 10, color: "var(--signal)" }}>↑ 6</span>
            </div>
            <WavePath width={280} height={52} color="var(--signal)" amp={0.7} freq={2} />
          </div>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", margin: "20px 0 12px" }}>
            attention
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(liveFlags && liveFlags.length > 0
              ? liveFlags.map((f) => ({ who: f.clientName, why: f.reason.slice(0, 48) }))
              : [
                  { who: "Jessica Park", why: "HRV declining, 21 days since last visit" },
                  { who: "Marcus Rivera", why: "low readiness, 54" },
                ]
            ).map((a, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(255,211,106,0.06)",
                  border: "1px solid rgba(255,211,106,0.25)",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--fog-0)" }}>{a.who}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--spark)", marginTop: 3 }}>
                  → {a.why}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WClientCheckinModal
        open={pairing !== null}
        clientId={pairing?.id ?? ""}
        clientName={pairing?.name ?? ""}
        onClose={() => setPairing(null)}
      />
    </WShell>
  );
}
