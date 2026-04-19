"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BioGrid, HRVSpark, Tag } from "@/components/primitives";
import { WShell } from "./shell";
import type { HealthSnapshot, SessionNote, ReasoningLine } from "@/lib/types";
import { recommend } from "@/lib/protocol-rules";
import { subscribeChannel } from "@/lib/realtime";

const REASON_COLOR: Record<ReasoningLine["color"], string> = {
  hrv: "var(--hrv)",
  hr: "var(--hr)",
  sleep: "var(--sleep)",
  note: "var(--lymph)",
  default: "var(--fog-3)",
};

function BioCell({
  label,
  value,
  unit,
  trend,
  trendColor,
  color,
  pct,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendColor?: string;
  color?: string;
  pct: number;
}) {
  return (
    <div
      style={{
        padding: 12,
        background: "var(--ink-2)",
        borderRadius: 12,
        border: "1px solid var(--ink-3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
        <span className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)", fontWeight: 300, lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>{unit}</span>}
      </div>
      {trend && (
        <div className="mono" style={{ fontSize: 9, color: trendColor, marginTop: 4 }}>
          {trend}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--ink-3)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ReasonCard({
  signal,
  evidence,
  param,
  color,
}: {
  signal: string;
  evidence: string;
  param: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: "var(--ink-2)",
        border: "1px solid var(--ink-3)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 2,
          background: color,
          borderRadius: 999,
        }}
      />
      <div className="mono upper" style={{ fontSize: 9, color }}>{signal}</div>
      <div style={{ fontSize: 12, color: "var(--fog-2)", marginTop: 4 }}>{evidence}</div>
      <div style={{ fontSize: 12, color: "var(--fog-0)", marginTop: 8, fontWeight: 500 }}>{param}</div>
    </div>
  );
}

function Param({
  label,
  value,
  unit,
  color = "var(--fog-0)",
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div>
      <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
        <span className="mono tnum" style={{ fontSize: 24, color, fontWeight: 300 }}>{value}</span>
        {unit && <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>{unit}</span>}
      </div>
    </div>
  );
}

export function WContext({
  clientId = "marcus-rivera",
  clientName = "Marcus Rivera",
  clientAge = 34,
  clientProfile = "endurance athlete",
  snapshots = [],
  priorNotes = [],
  sessionNotes = [],
}: {
  clientId?: string;
  clientName?: string;
  clientAge?: number;
  clientProfile?: string;
  snapshots?: HealthSnapshot[];
  priorNotes?: { date: string; quote: string }[];
  sessionNotes?: SessionNote[];
}) {
  const latest = snapshots[snapshots.length - 1];
  const earliest = snapshots[0];
  const initials = clientName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const hrv = latest ? Math.round(Number(latest.hrv_ms)) : 50;
  const baselineHrv = earliest ? Math.round(Number(earliest.hrv_ms)) : 72;
  const hrvDelta = baselineHrv > 0 ? Math.round(((hrv - baselineHrv) / baselineHrv) * 100) : 0;
  const rhr = latest ? latest.resting_hr_bpm : 66;
  const rhrBaseline = earliest ? earliest.resting_hr_bpm : 58;
  const rhrDelta = rhr - rhrBaseline;
  const sleep = latest ? latest.sleep_score : 55;
  const sleepLabel = `${Math.floor(sleep / 12)}:${String(Math.round(((sleep / 12) % 1) * 60)).padStart(2, "0")}`;

  const hrvTrend = snapshots.length > 0 ? snapshots.map((s) => Math.round(Number(s.hrv_ms))) : [72, 70, 68, 65, 63, 67, 62, 60, 58, 55, 58, 54, 52, 50];

  const displayNotes = priorNotes.length > 0 ? priorNotes.slice(0, 2) : [
    { date: "apr 11", quote: "Left trap is worse this week, honestly" },
    { date: "mar 24", quote: "left trap is a bit tight" },
  ];

  const reco = recommend(snapshots, sessionNotes);
  const headline = reco.protocol.displayName;
  const emphasis = reco.protocol.parameters.emphasis ?? "bilateral";
  const frequencyHz = reco.protocol.parameters.frequency_hz ?? 30;
  const placement = reco.protocol.parameters.placement;

  const router = useRouter();
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    const unsub = subscribeChannel<{ clientId: string }>(
      `onboarding:${clientId}`,
      "health_connected",
      () => {
        setFresh(true);
        router.refresh();
        setTimeout(() => setFresh(false), 2400);
        // After the data-received animation settles, hand off to the
        // tailored-questions onboarding view so the demo reads as a single flow.
        setTimeout(() => {
          router.push(`/practitioner/session/${clientId}/onboarding`);
        }, 3600);
      }
    );
    return unsub;
  }, [clientId, router]);

  return (
    <WShell pageName="today">
      <div
        style={{
          padding: "12px 28px",
          background: "linear-gradient(90deg, rgba(212,244,90,0.12), rgba(212,244,90,0.02))",
          borderBottom: "1px solid rgba(212,244,90,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--signal)",
            boxShadow: "0 0 12px var(--signal)",
            animation: "breathe 1.6s infinite",
          }}
        />
        <span className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>
          Just scanned · 11:28 AM · Bay 3
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 10, color: "var(--fog-2)" }}>
          Data window: Apr 5 → Apr 18 · 14d
        </span>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "360px 1fr", overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid var(--ink-3)", padding: "22px 24px", overflow: "auto" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background:
                  "repeating-linear-gradient(-20deg, #2a3138, #2a3138 4px, #353d46 4px, #353d46 5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--fog-2)",
                fontSize: 22,
                fontWeight: 500,
                border: "1px solid var(--ink-4)",
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, color: "var(--fog-0)", fontWeight: 500 }}>{clientName}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--fog-3)", marginTop: 2 }}>
                {clientAge} · {clientProfile} · 7th session
              </div>
            </div>
          </div>

          <motion.div
            key={fresh ? "fresh-bio" : "static-bio"}
            initial={fresh ? { opacity: 0.2, filter: "blur(4px)" } : false}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
          >
            <BioCell label="HRV" value={String(hrv)} unit="ms" trend={`${hrvDelta}%`} trendColor="var(--flare)" color="var(--hrv)" pct={Math.min(100, hrv)} />
            <BioCell label="Resting" value={String(rhr)} unit="bpm" trend={`↑${rhrDelta}`} trendColor="var(--flare)" color="var(--hr)" pct={Math.min(100, rhr)} />
            <BioCell label="Sleep" value={sleepLabel} trend={sleep < 65 ? "poor" : "ok"} trendColor={sleep < 65 ? "var(--flare)" : "var(--signal)"} color="var(--sleep)" pct={sleep} />
          </motion.div>
          <AnimatePresence>
            {fresh && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(212,244,90,0.1)",
                  border: "1px solid rgba(212,244,90,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--signal)",
                    boxShadow: "0 0 8px var(--signal)",
                    animation: "breathe 1s infinite",
                  }}
                />
                <span className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>
                  Signals received · Health Connect
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginTop: 20 }}>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
              14-day HRV · baseline {baselineHrv}ms
            </div>
            <div
              style={{
                padding: 12,
                background: "var(--ink-2)",
                borderRadius: 12,
                border: "1px solid var(--ink-3)",
              }}
            >
              <HRVSpark
                data={hrvTrend}
                width={300}
                height={60}
                color="var(--signal)"
                threshold={62}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>Apr 5</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--flare)" }}>↓ trend, 14 days</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>today</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
              notes flagged from prior visits
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {displayNotes.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    background: "var(--ink-2)",
                    borderRadius: 10,
                    border: "1px solid var(--ink-3)",
                  }}
                >
                  <div
                    className="serif"
                    style={{ fontSize: 13, fontStyle: "italic", color: "var(--fog-0)", lineHeight: 1.3 }}
                  >
                    &ldquo;{n.quote}&rdquo;
                  </div>
                  <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginTop: 6 }}>
                    session · {n.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 28px", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>
                recommended protocol
              </div>
              <div className="serif" style={{ fontSize: 30, letterSpacing: -0.02, marginTop: 6 }}>
                {headline.split(new RegExp(`(${emphasis})`, "i")).map((frag, i) =>
                  frag.toLowerCase() === emphasis.toLowerCase() ? (
                    <em key={i} style={{ color: "var(--signal)" }}>{frag}</em>
                  ) : (
                    <span key={i}>{frag}</span>
                  )
                )}
              </div>
            </div>
            <Tag color="var(--signal)" variant="solid">confidence · {reco.confidence}</Tag>
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {reco.reasoning.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.18, duration: 0.3 }}
              >
                <ReasonCard
                  signal={line.signal}
                  evidence={line.evidence}
                  param={`→ ${line.mapsTo}`}
                  color={REASON_COLOR[line.color]}
                />
              </motion.div>
            ))}
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 20,
              borderRadius: 16,
              background: "linear-gradient(180deg, rgba(212,244,90,0.04), transparent), var(--ink-1)",
              border: "1px solid var(--ink-3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <BioGrid color="rgba(212,244,90,0.04)" size={18} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, position: "relative" }}>
              <Param label="duration" value={String(reco.protocol.duration_min)} unit="min" />
              <Param label="vibration" value={String(frequencyHz)} unit="Hz" color="var(--lymph)" />
              <Param label="thermal" value={emphasis === "cooling" ? "−4°" : emphasis === "warmth" ? "+3°" : "0°"} unit={emphasis === "cooling" ? "cool" : emphasis === "warmth" ? "warm" : "neutral"} color={emphasis === "cooling" ? "var(--cool)" : emphasis === "warmth" ? "var(--flare)" : "var(--fog-0)"} />
              <Param label="belt" value={placement ? placement.replace("Sun pad ", "Sun · ").replace("left", "L").replace("right", "R") : "Bilateral"} color="var(--signal)" />
            </div>
            <div style={{ height: 1, background: "var(--ink-3)", margin: "18px 0 14px" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/practitioner/session/${clientId}/onboarding`}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--signal)",
                  color: "var(--signal-ink)",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--sans)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Begin onboarding →
              </Link>
              <Link
                href={`/practitioner/session/${clientId}/device`}
                style={{
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 10,
                  background: "var(--ink-2)",
                  color: "var(--fog-0)",
                  border: "1px solid var(--ink-3)",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Skip to live
              </Link>
              <button
                type="button"
                style={{
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 10,
                  background: "var(--ink-2)",
                  color: "var(--fog-0)",
                  border: "1px solid var(--ink-3)",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                  cursor: "pointer",
                }}
              >
                Modify
              </button>
              <button
                type="button"
                style={{
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 10,
                  background: "transparent",
                  color: "var(--fog-2)",
                  border: "1px solid var(--ink-3)",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                  cursor: "pointer",
                }}
              >
                Override
              </button>
            </div>
          </div>

          <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 16, textAlign: "center" }}>
            rule-based · plain-language · you&rsquo;re in charge
          </div>
        </div>
      </div>
    </WShell>
  );
}
