"use client";

import { Tag } from "@/components/primitives";
import { StatBlock, WHeader, WShell } from "./shell";

function BodyMap() {
  return (
    <svg width="100%" height="200" viewBox="0 0 120 200" style={{ display: "block" }}>
      <path
        d="M60 10 a10 10 0 0 1 0 20 a10 10 0 0 1 0 -20 M40 35 h40 v30 l15 40 l-8 3 l-12 -30 v50 l6 55 h-10 l-6 -45 h-10 l-6 45 h-10 l6 -55 v-50 l-12 30 l-8 -3 l15 -40 z"
        fill="var(--ink-3)"
        stroke="var(--ink-4)"
        strokeWidth="0.5"
      />
      <circle cx="48" cy="42" r="8" fill="var(--flare)" opacity="0.7">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="105" r="6" fill="var(--spark)" opacity="0.6" />
      <circle cx="70" cy="80" r="5" fill="var(--spark)" opacity="0.5" />
      <text x="78" y="45" fontSize="6" fill="var(--flare)" fontFamily="var(--mono)">
        L trap ×4
      </text>
      <text x="72" y="110" fontSize="6" fill="var(--spark)" fontFamily="var(--mono)">
        low back
      </text>
    </svg>
  );
}

function BigChart() {
  const data = [72, 68, 70, 66, 63, 58, 60, 56, 54, 52, 55, 53, 50, 54];
  const sessions = [0, 3, 6, 9, 13];
  const w = 600;
  const h = 140;
  const max = 80;
  const min = 40;
  const range = max - min;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 20) - 10;
    return { x, y, v };
  });
  const pathD = "M " + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  const fillD = pathD + ` L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="bgFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--signal)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 60, 80].map((v) => {
        const y = h - ((v - min) / range) * (h - 20) - 10;
        return (
          <g key={v}>
            <line x1="0" x2={w} y1={y} y2={y} stroke="var(--ink-3)" strokeDasharray="2 4" />
            <text x="4" y={y - 3} fontSize="9" fill="var(--fog-3)" fontFamily="var(--mono)">
              {v}ms
            </text>
          </g>
        );
      })}
      <line
        x1="0"
        x2={w}
        y1={h - ((68 - min) / range) * (h - 20) - 10}
        y2={h - ((68 - min) / range) * (h - 20) - 10}
        stroke="var(--fog-3)"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <text
        x={w - 60}
        y={h - ((68 - min) / range) * (h - 20) - 14}
        fontSize="9"
        fill="var(--fog-3)"
        fontFamily="var(--mono)"
      >
        baseline 68
      </text>
      <path d={fillD} fill="url(#bgFill)" />
      <path
        d={pathD}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {sessions.map((i) => {
        const p = pts[i];
        return (
          <g key={i}>
            <line x1={p.x} x2={p.x} y1={0} y2={h} stroke="var(--signal)" strokeDasharray="2 3" opacity="0.3" />
            <circle cx={p.x} cy={p.y} r="5" fill="var(--signal-ink)" stroke="var(--signal)" strokeWidth="2" />
          </g>
        );
      })}
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="8" fill="var(--signal)" opacity="0.3">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill="var(--signal)" />
    </svg>
  );
}

export function WClientProfile() {
  return (
    <WShell pageName="clients">
      <WHeader
        title="Jordan Kim"
        sub="client · paired 6 weeks · 7 sessions"
        right={
          <div style={{ display: "flex", gap: 24 }}>
            <StatBlock value="+74ms" label="cum. HRV lift" color="var(--signal)" />
            <StatBlock value="$1,050" label="lifetime rev" />
            <StatBlock value="1.2w" label="avg rebook" />
          </div>
        }
      />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr 340px", overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid var(--ink-3)", padding: "20px 20px", overflow: "auto" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background:
                "repeating-linear-gradient(-20deg, #2a3138, #2a3138 4px, #353d46 4px, #353d46 5px)",
              border: "1px solid var(--ink-4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fog-2)",
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            JK
          </div>
          <div style={{ marginTop: 14, fontSize: 18, color: "var(--fog-0)", fontWeight: 500 }}>Jordan Kim</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 3 }}>
            34 · she/her · austin
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              ["endurance athlete", "profile"],
              ["apr 10 (7d ago)", "last visit"],
              ["apr 24", "next · booked"],
              ["hydrawav3 belt", "device"],
            ].map(([v, k], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < 3 ? "1px solid var(--ink-3)" : "none",
                }}
              >
                <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "var(--fog-0)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 20, marginBottom: 10 }}>
            body map · hot spots
          </div>
          <BodyMap />
        </div>

        <div style={{ padding: "20px 24px", overflow: "auto" }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 14 }}>
            HRV · 14d rolling · session markers
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              marginBottom: 18,
            }}
          >
            <BigChart />
          </div>

          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 12 }}>
            session timeline
          </div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 8,
                bottom: 8,
                width: 1,
                background: "var(--ink-3)",
              }}
            />
            {[
              { n: 7, d: "today", q: '"left trap is worse this week"', hrv: "+18", live: true },
              { n: 6, d: "apr 10", q: '"hip feels locked"', hrv: "+12" },
              { n: 5, d: "apr 03", q: '"slept great"', hrv: "+7" },
              { n: 4, d: "mar 27", q: '"low back tight"', hrv: "+9" },
            ].map((s, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 14 }}>
                <div
                  style={{
                    position: "absolute",
                    left: -18,
                    top: 4,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: s.live ? "var(--signal)" : "var(--ink-3)",
                    boxShadow: s.live ? "0 0 12px var(--signal)" : "none",
                    border: s.live ? "none" : "2px solid var(--ink-0)",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
                    session {s.n}
                  </span>
                  <span className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>· {s.d}</span>
                  {s.live && (
                    <Tag color="var(--signal)" variant="solid">
                      today
                    </Tag>
                  )}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 15,
                    fontStyle: "italic",
                    color: "var(--fog-0)",
                    marginTop: 3,
                  }}
                >
                  {s.q}
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--signal)", marginTop: 2 }}>
                  hrv {s.hrv}ms
                </div>
              </div>
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
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 10 }}>
            personal pattern · learned
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "rgba(212,244,90,0.05)",
              border: "1px solid rgba(212,244,90,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="4" fill="var(--signal)" />
              </svg>
              <span className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>
                her rebook rhythm
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fog-0)", marginTop: 8, lineHeight: 1.4 }}>
              Books every 12–14 days. Last visit was 12 days ago, she&rsquo;s due.
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 8 }}>
              → next opening: Thursday 2pm
            </div>
          </div>

          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", margin: "20px 0 10px" }}>
            recurring themes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { t: "left trap", n: 4 },
              { t: "low back", n: 3 },
              { t: "sleep quality", n: 3 },
              { t: "hip flexor (R)", n: 2 },
              { t: "post-race recovery", n: 2 },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: "var(--ink-2)",
                  borderRadius: 8,
                  border: "1px solid var(--ink-3)",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--fog-0)" }}>{t.t}</span>
                <span className="mono tnum" style={{ fontSize: 11, color: "var(--signal)" }}>
                  ×{t.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WShell>
  );
}
