"use client";

import { HRVSpark, Tag } from "@/components/primitives";
import { StatBlock, WHeader, WShell } from "./shell";

type Severity = "low" | "medium" | "high";

export function WRelapseFlag() {
  const flags: {
    name: string;
    severity: Severity;
    reason: string;
    signals: string[];
    lastVisit: string;
    hrvTrend: number[];
  }[] = [
    {
      name: "Jessica Park",
      severity: "high",
      reason: "HRV down 14% over 8 days, pain flagged in last session, 18 days since visit.",
      signals: ["HRV ↓ 14% · 8 days", '"shoulder still locked" · apr 1', "18d since visit"],
      lastVisit: "Apr 1",
      hrvTrend: [62, 60, 58, 56, 54, 52, 50, 48],
    },
    {
      name: "Devon Park",
      severity: "medium",
      reason: "First visit in 6 weeks. Sleep score trending down.",
      signals: ["42 days since visit", "sleep score 58 · last 5 nights"],
      lastVisit: "Mar 6",
      hrvTrend: [68, 66, 67, 64, 62, 60, 61, 58],
    },
    {
      name: "Marcus Rivera",
      severity: "low",
      reason: "HRV trending down for 5 days.",
      signals: ["HRV ↓ 8% · 5 days"],
      lastVisit: "Apr 11",
      hrvTrend: [70, 69, 66, 65, 64, 63, 62, 62],
    },
  ];

  const badgeColor = (s: Severity) =>
    s === "high" ? "var(--flare)" : s === "medium" ? "var(--spark)" : "var(--cool)";

  return (
    <WShell pageName="relapse">
      <WHeader
        title="Relapse flags"
        sub="post-session intelligence · practitioner decides"
        right={
          <div style={{ display: "flex", gap: 24 }}>
            <StatBlock value="3" label="flagged" color="var(--flare)" />
            <StatBlock value="1.2w" label="avg rebook lift" color="var(--signal)" />
            <StatBlock value="68%" label="outreach → book" trend="+22 pts" />
          </div>
        }
      />
      <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>
        <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 14 }}>
          flags this week · sorted by severity
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {flags.map((f, i) => (
            <div
              key={i}
              style={{
                padding: 20,
                borderRadius: 16,
                background: "var(--ink-2)",
                border:
                  f.severity === "high"
                    ? "1px solid rgba(255,106,61,0.4)"
                    : "1px solid var(--ink-3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {f.severity === "high" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 0% 50%, rgba(255,106,61,0.08), transparent 55%)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 180px",
                  gap: 20,
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 18, color: "var(--fog-0)", fontWeight: 500 }}>{f.name}</span>
                    <Tag color={badgeColor(f.severity)} variant="solid">
                      {f.severity}
                    </Tag>
                    <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                      last · {f.lastVisit}
                    </span>
                  </div>
                  <div className="serif" style={{ fontSize: 16, color: "var(--fog-0)", fontStyle: "italic" }}>
                    {f.reason}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {f.signals.map((s, j) => (
                      <Tag key={j} color={badgeColor(f.severity)}>
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    padding: 10,
                    background: "var(--ink-1)",
                    borderRadius: 10,
                    border: "1px solid var(--ink-3)",
                  }}
                >
                  <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginBottom: 6 }}>
                    HRV · 8d trend
                  </div>
                  <HRVSpark
                    data={f.hrvTrend}
                    width={140}
                    height={36}
                    color={badgeColor(f.severity)}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    style={{
                      height: 40,
                      borderRadius: 10,
                      background: "var(--signal)",
                      color: "var(--signal-ink)",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "var(--sans)",
                      cursor: "pointer",
                    }}
                  >
                    Draft message
                  </button>
                  <button
                    style={{
                      height: 32,
                      borderRadius: 8,
                      background: "transparent",
                      color: "var(--fog-2)",
                      border: "1px solid var(--ink-3)",
                      fontSize: 11,
                      fontFamily: "var(--sans)",
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 18,
            borderRadius: 14,
            background: "var(--ink-1)",
            border: "1px solid var(--ink-3)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 10 }}>
            how flags are computed
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--fog-2)",
              lineHeight: 1.6,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <div>
              <Tag color="var(--flare)" variant="solid" style={{ marginBottom: 6 }}>
                high
              </Tag>
              <div>HRV trending down 7+ days AND pain mentioned in last 2 sessions AND 14+ days since visit.</div>
            </div>
            <div>
              <Tag color="var(--spark)" variant="solid" style={{ marginBottom: 6 }}>
                medium
              </Tag>
              <div>Any two of the above conditions met.</div>
            </div>
            <div>
              <Tag color="var(--cool)" variant="solid" style={{ marginBottom: 6 }}>
                low
              </Tag>
              <div>Any one of the above conditions met.</div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fog-3)", marginTop: 14 }}>
            Practitioner-first framing. The flag surfaces a suggestion. The practitioner decides.
          </div>
        </div>
      </div>
    </WShell>
  );
}
