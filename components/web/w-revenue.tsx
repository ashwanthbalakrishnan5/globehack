"use client";

import { BioGrid } from "@/components/primitives";
import { StatBlock, WHeader, WShell } from "./shell";

function RevenueChart() {
  const weeks = 12;
  const signal = [400, 320, 520, 480, 640, 580, 720, 690, 810, 780, 890, 920];
  const organic = [1200, 1100, 1180, 1240, 1280, 1220, 1300, 1320, 1380, 1340, 1420, 1440];
  const w = 900;
  const h = 180;
  const max = 2400;
  const bw = w / weeks - 8;
  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width: "100%", display: "block" }}>
      {[500, 1000, 1500, 2000].map((v) => {
        const y = h - (v / max) * h;
        return (
          <g key={v}>
            <line x1="0" x2={w} y1={y} y2={y} stroke="var(--ink-3)" strokeDasharray="2 4" />
            <text x="4" y={y - 3} fontSize="9" fill="var(--fog-3)" fontFamily="var(--mono)">
              ${v}
            </text>
          </g>
        );
      })}
      {signal.map((s, i) => {
        const x = i * (w / weeks) + 4;
        const o = organic[i];
        const sh = (s / max) * h;
        const oh = (o / max) * h;
        return (
          <g key={i}>
            <rect x={x} y={h - oh} width={bw} height={oh} fill="var(--ink-4)" rx="2" />
            <rect x={x} y={h - oh - sh} width={bw} height={sh} fill="var(--signal)" rx="2" />
            <text
              x={x + bw / 2}
              y={h + 18}
              fontSize="8"
              fill="var(--fog-3)"
              fontFamily="var(--mono)"
              textAnchor="middle"
            >
              w{i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function WRevenue() {
  return (
    <WShell pageName="revenue">
      <WHeader
        title="Payback, month two."
        sub="revenue attributable to Tide"
        right={
          <div style={{ display: "flex", gap: 24 }}>
            <StatBlock value="+$2,340" label="this month" color="var(--signal)" trend="vs $199 seat" />
            <StatBlock value="11.8×" label="ROI" />
            <StatBlock value="68%" label="rebook rate" trend="+22 pts" />
          </div>
        }
      />
      <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>
        <div
          style={{
            padding: 24,
            borderRadius: 18,
            background: "var(--ink-1)",
            border: "1px solid var(--ink-3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <BioGrid color="rgba(212,244,90,0.04)" size={20} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 20,
            }}
          >
            <div>
              <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                dollar lift · last 90 days
              </div>
              <div className="serif" style={{ fontSize: 28, marginTop: 6, letterSpacing: -0.02 }}>
                $6,890 <em style={{ color: "var(--signal)" }}>from rebook lift</em>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--signal)" }} />
                  <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
                    Tide-driven
                  </span>
                </div>
                <div className="mono tnum" style={{ fontSize: 14, color: "var(--fog-0)", marginTop: 4 }}>
                  46
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--ink-4)" }} />
                  <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
                    organic
                  </span>
                </div>
                <div className="mono tnum" style={{ fontSize: 14, color: "var(--fog-0)", marginTop: 4 }}>
                  82
                </div>
              </div>
            </div>
          </div>
          <RevenueChart />
        </div>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[
            { k: "avg rebook lift", v: "+$150", unit: "per client", c: "var(--signal)" },
            { k: "intake time saved", v: "4.2m", unit: "per session", c: "var(--fog-0)" },
            { k: "card shares", v: "18", unit: "this month · referrals", c: "var(--cool)" },
            { k: "device retention", v: "97%", unit: "vs 81% without", c: "var(--lymph)" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: 18,
                borderRadius: 14,
                background: "var(--ink-2)",
                border: "1px solid var(--ink-3)",
              }}
            >
              <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>{s.k}</div>
              <div
                className="mono tnum"
                style={{ fontSize: 28, color: s.c, marginTop: 10, fontWeight: 300, lineHeight: 1 }}
              >
                {s.v}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 6 }}>
                {s.unit}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 12 }}>
            rebook outcomes · 30 days
          </div>
          <div
            style={{
              background: "var(--ink-2)",
              borderRadius: 14,
              border: "1px solid var(--ink-3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 1fr 1fr 0.8fr",
                padding: "10px 16px",
                background: "var(--ink-3)",
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--fog-3)",
                textTransform: "uppercase",
                letterSpacing: 0.1,
              }}
            >
              <span>client</span>
              <span>fired</span>
              <span>action</span>
              <span>outcome</span>
              <span style={{ textAlign: "right" }}>$</span>
            </div>
            {[
              { c: "Devon Park", f: "today", a: "drafted", o: "pending", d: "—" },
              { c: "Lee Tran", f: "apr 14", a: "texted +1d", o: "booked +2d", d: "+$150" },
              { c: "Priya Shah", f: "apr 9", a: "texted", o: "booked +5d · 2 sessions", d: "+$300" },
              { c: "Devon Park", f: "apr 4", a: "called", o: "booked +3d", d: "+$150" },
              { c: "Alina Zhou", f: "mar 28", a: "dismissed", o: "booked +14d organic", d: "—" },
              { c: "Marcus Lee", f: "mar 22", a: "texted", o: "booked +6d · 3 sessions", d: "+$450" },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 1fr 1fr 0.8fr",
                  padding: "12px 16px",
                  fontSize: 12,
                  alignItems: "center",
                  borderTop: i > 0 ? "1px solid var(--ink-3)" : "none",
                }}
              >
                <span style={{ color: "var(--fog-0)" }}>{r.c}</span>
                <span className="mono" style={{ color: "var(--fog-3)", fontSize: 11 }}>{r.f}</span>
                <span style={{ color: "var(--fog-2)" }}>{r.a}</span>
                <span style={{ color: "var(--fog-0)", fontSize: 11 }}>{r.o}</span>
                <span
                  className="mono tnum"
                  style={{
                    color: r.d === "—" ? "var(--fog-3)" : "var(--signal)",
                    textAlign: "right",
                    fontWeight: 500,
                  }}
                >
                  {r.d}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WShell>
  );
}
