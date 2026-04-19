"use client";

import Link from "next/link";
import { MScreen } from "./shell";
import { HRVSpark, RingGauge, Tag, TideMark } from "@/components/primitives";
import { CLIENTS, PRACTITIONER } from "@/lib/mock-data";

export function MHome() {
  const client = CLIENTS[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TideMark size={22} />
            <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>
              Tide
            </span>
          </div>
          <Link
            href="/client/settings"
            aria-label="Data controls"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid var(--ink-3)",
              background: "var(--ink-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fog-2)",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ▤
          </Link>
        </div>

        <div style={{ marginTop: 28 }}>
          <div
            className="mono upper"
            style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.14 }}
          >
            {greeting}
          </div>
          <div className="display-xl" style={{ marginTop: 6 }}>
            Hey <em>{client.name.split(" ")[0]}</em>.
          </div>
          <div style={{ fontSize: 14, color: "var(--fog-2)", marginTop: 6 }}>
            Fourteen days of signal, one window. With {PRACTITIONER.name.split(" ")[0]}.
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 18,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(212,244,90,0.1), transparent 60%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div
            className="mono upper"
            style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 12, position: "relative" }}
          >
            today · 14-day window
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              position: "relative",
            }}
          >
            {[
              {
                label: "HRV",
                value: `${client.latest.hrvMs}`,
                unit: "ms",
                pct: 58,
                color: "var(--hrv)",
                delta: `${client.latest.hrvTrendPct}%`,
                deltaColor: "var(--flare)",
              },
              {
                label: "Resting",
                value: `${client.latest.restingHrBpm}`,
                unit: "bpm",
                pct: 72,
                color: "var(--hr)",
                delta: `↑${client.latest.restingHrDelta}`,
                deltaColor: "var(--flare)",
              },
              {
                label: "Sleep",
                value: client.latest.sleepLabel,
                unit: null,
                pct: client.latest.sleepPct,
                color: "var(--sleep)",
                delta: "light",
                deltaColor: "var(--spark)",
              },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RingGauge size={68} pct={m.pct} stroke={5} color={m.color} />
                <div style={{ textAlign: "center" }}>
                  <div
                    className="mono tnum"
                    style={{ fontSize: 20, color: "var(--fog-0)", fontWeight: 300, lineHeight: 1 }}
                  >
                    {m.value}
                    {m.unit && (
                      <span style={{ fontSize: 10, color: "var(--fog-3)" }}> {m.unit}</span>
                    )}
                  </div>
                  <div
                    className="mono upper"
                    style={{ fontSize: 8, color: "var(--fog-3)", marginTop: 4, letterSpacing: 0.12 }}
                  >
                    {m.label}
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: m.deltaColor, marginTop: 2 }}>
                    {m.delta}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, position: "relative" }}>
            <HRVSpark
              data={client.hrvTrend14}
              width={320}
              height={40}
              color="var(--signal)"
              threshold={62}
            />
            <div
              className="mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                color: "var(--fog-3)",
                marginTop: 4,
              }}
            >
              <span>Apr 3</span>
              <span style={{ color: "var(--flare)" }}>↓ 9 days</span>
              <span>today</span>
            </div>
          </div>
        </div>

        <Link
          href="/client/checkin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 20,
            padding: "20px 22px",
            borderRadius: 18,
            background: "var(--signal)",
            color: "var(--signal-ink)",
            textDecoration: "none",
            boxShadow: "var(--glow-signal)",
          }}
        >
          <div>
            <div
              className="mono upper"
              style={{ fontSize: 10, color: "var(--signal-ink)", opacity: 0.7, letterSpacing: 0.14 }}
            >
              11:30 today · bay 3
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 24,
                lineHeight: 1.15,
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              Check in with {PRACTITIONER.name.split(" ")[0]}
            </div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(26,39,8,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            →
          </div>
        </Link>

        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
              recent sessions
            </div>
            <Link
              href="/client/history"
              className="mono upper"
              style={{ fontSize: 10, color: "var(--signal)", textDecoration: "none" }}
            >
              all →
            </Link>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { n: "06", date: "apr 10", tag: '"hip feels locked"', hrv: "+12" },
              { n: "05", date: "apr 03", tag: '"slept great"', hrv: "+7" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "var(--ink-2)",
                  borderRadius: 12,
                  border: "1px solid var(--ink-3)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "var(--ink-3)",
                    color: "var(--fog-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="serif"
                    style={{
                      fontSize: 14,
                      color: "var(--fog-0)",
                      fontStyle: "italic",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.tag}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 3 }}
                  >
                    {s.date} · hrv {s.hrv}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--fog-3)" }}>
                  →
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Link
            href="/client/coherence"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 14,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              textDecoration: "none",
              color: "var(--fog-0)",
            }}
          >
            <span className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>
              tonight · 4 min
            </span>
            <span style={{ fontSize: 13 }}>Breathe with protocol 7</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
              coherence ring
            </span>
          </Link>
        </div>
        <Tag
          color="var(--fog-3)"
          style={{ marginTop: 16, display: "inline-flex" }}
        >
          session-scoped · revocable · never central
        </Tag>
      </div>
      <div style={{ height: 20 }} />
    </MScreen>
  );
}
