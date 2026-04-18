"use client";

import Link from "next/link";
import { BioGrid, HRVSpark, Tag } from "@/components/primitives";
import { WShell } from "./shell";

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

export function WContext() {
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
          Data window: Apr 3 → Apr 17 · 14d
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
              JK
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, color: "var(--fog-0)", fontWeight: 500 }}>Jordan Kim</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--fog-3)", marginTop: 2 }}>
                34 · endurance athlete · 7th session
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <BioCell label="HRV" value="54" unit="ms" trend="↓ 18%" trendColor="var(--flare)" color="var(--hrv)" pct={54} />
            <BioCell label="Resting" value="64" unit="bpm" trend="↑ 6" trendColor="var(--flare)" color="var(--hr)" pct={78} />
            <BioCell label="Sleep" value="5:42" trend="poor" trendColor="var(--flare)" color="var(--sleep)" pct={55} />
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
              14-day HRV · baseline 68ms
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
                data={[72, 70, 68, 66, 62, 58, 60, 56, 54, 52, 55, 53, 50, 54]}
                width={300}
                height={60}
                color="var(--signal)"
                threshold={62}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>Apr 3</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--flare)" }}>↓ trend, 9 days</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>today</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
              notes flagged from prior visits
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { d: "apr 10", q: "hip feels locked up since the half-marathon" },
                { d: "apr 03", q: "left trap been bothering me for a week" },
              ].map((n, i) => (
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
                    &ldquo;{n.q}&rdquo;
                  </div>
                  <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginTop: 6 }}>
                    session · {n.d}
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
                Parasympathetic reset, <em style={{ color: "var(--signal)" }}>cooling</em>.
              </div>
            </div>
            <Tag color="var(--signal)" variant="solid">confidence · high</Tag>
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ReasonCard signal="HRV 54ms" evidence="down 18% from personal baseline" param="→ parasympathetic emphasis" color="var(--hrv)" />
            <ReasonCard signal="Resting HR 64" evidence="elevated 6 bpm, 4 days" param="→ 40Hz lymphatic vibration" color="var(--hr)" />
            <ReasonCard signal="Sleep 5h42m" evidence="2 nights < 6h" param="→ extended duration · 38m" color="var(--sleep)" />
            <ReasonCard signal="Prior note" evidence={`"hip locked up" · apr 10`} param="→ belt placement L4–L5" color="var(--lymph)" />
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
              <Param label="duration" value="38" unit="min" />
              <Param label="vibration" value="40" unit="Hz" color="var(--lymph)" />
              <Param label="thermal" value="−4°" unit="cool" color="var(--cool)" />
              <Param label="belt" value="L4–L5" color="var(--signal)" />
            </div>
            <div style={{ height: 1, background: "var(--ink-3)", margin: "18px 0 14px" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/practitioner/session/jordan-kim/live"
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
                }}
              >
                Accept &amp; start
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
