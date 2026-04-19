"use client";

import Link from "next/link";
import { Meter, Tag, VoiceWave, WavePath } from "@/components/primitives";
import { WShell } from "./shell";

export function WLiveSession() {
  const transcript = [
    { speaker: "you", t: "0:12", text: "How's the trap feeling today?" },
    {
      speaker: "client",
      t: "0:14",
      text: "Honestly, it's worse than last week. Sleeping on the left side is rough.",
      flag: "complaint",
      hl: "worse than last week",
    },
    { speaker: "you", t: "0:22", text: "Any radiating down the arm?" },
    { speaker: "client", t: "0:25", text: "No, just a knot right here." },
    { speaker: "you", t: "3:48", text: "Okay starting the 40Hz sweep." },
    {
      speaker: "client",
      t: "14:02",
      text: "Can you do that spot again? The one from last time.",
      flag: "preference",
      hl: "that spot again",
    },
    {
      speaker: "client",
      t: "18:40",
      text: "Hmm. I noticed my resting heart rate has been way up since the race.",
      flag: "self-report",
      hl: "heart rate has been way up",
    },
  ];
  return (
    <WShell pageName="live">
      <div
        style={{
          padding: "12px 28px",
          background: "rgba(212,244,90,0.04)",
          borderBottom: "1px solid var(--ink-3)",
          display: "flex",
          alignItems: "center",
          gap: 14,
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
            animation: "breathe 1.4s infinite",
          }}
        />
        <span className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>
          Live · Marcus Rivera · Bay 3
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono tnum" style={{ fontSize: 14, color: "var(--fog-0)" }}>
          19:42 <span style={{ color: "var(--fog-3)", fontSize: 11 }}>/ 38:00</span>
        </span>
        <div style={{ width: 1, height: 16, background: "var(--ink-3)" }} />
        <span className="mono" style={{ fontSize: 10, color: "var(--fog-2)" }}>
          HR 74 · ↓ 10 since start
        </span>
        <div style={{ width: 1, height: 16, background: "var(--ink-3)" }} />
        <Link
          href="/practitioner/session/marcus-rivera/resonance"
          className="mono upper"
          style={{
            fontSize: 10,
            color: "var(--fog-2)",
            textDecoration: "none",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--ink-3)",
            letterSpacing: 0.12,
          }}
        >
          resonance map →
        </Link>
        <Link
          href="/practitioner/session/marcus-rivera/notes"
          style={{
            fontSize: 12,
            color: "var(--signal-ink)",
            fontFamily: "var(--sans)",
            fontWeight: 600,
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 8,
            background: "var(--signal)",
          }}
        >
          End &amp; review
        </Link>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", overflow: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 4 }}>
            ambient transcript · on-device diarization
          </div>
          {transcript.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                padding: "10px 14px",
                background: t.flag ? "rgba(212,244,90,0.06)" : "transparent",
                border: t.flag ? "1px solid rgba(212,244,90,0.2)" : "1px solid transparent",
                borderRadius: 10,
              }}
            >
              <div style={{ width: 70, flexShrink: 0 }}>
                <div
                  className="mono upper"
                  style={{
                    fontSize: 9,
                    color: t.speaker === "you" ? "var(--fog-3)" : "var(--signal)",
                  }}
                >
                  {t.speaker === "you" ? "MAYA" : "MARCUS"}
                </div>
                <div className="mono tnum" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
                  {t.t}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "var(--fog-0)", lineHeight: 1.4 }}>
                  {t.hl ? (
                    <>
                      {t.text.split(t.hl)[0]}
                      <span
                        style={{
                          background: "rgba(212,244,90,0.22)",
                          color: "var(--signal)",
                          padding: "1px 3px",
                          borderRadius: 2,
                        }}
                      >
                        {t.hl}
                      </span>
                      {t.text.split(t.hl)[1]}
                    </>
                  ) : (
                    t.text
                  )}
                </div>
                {t.flag && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <Tag color="var(--signal)">{t.flag}</Tag>
                    <Tag color="var(--fog-3)">→ auto-note</Tag>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px" }}>
            <div style={{ width: 70 }}>
              <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>listening</div>
            </div>
            <VoiceWave color="var(--signal)" bars={16} />
            <div
              style={{
                width: 2,
                height: 14,
                background: "var(--signal)",
                animation: "caret-blink 1s infinite",
              }}
            />
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
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            live vitals
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              marginBottom: 12,
            }}
          >
            <WavePath width={280} height={40} color="var(--hr)" amp={0.7} freq={4} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <div>
                <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)" }}>74</div>
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>hr live</div>
              </div>
              <div>
                <div className="mono tnum" style={{ fontSize: 22, color: "var(--signal)" }}>↓10</div>
                <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>drop</div>
              </div>
            </div>
          </div>

          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", margin: "16px 0 10px" }}>
            protocol · live
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--fog-0)", fontWeight: 500 }}>
              Parasympathetic · cooling
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 4 }}>
              40Hz · −4° · 38min · L4–L5
            </div>
            <div style={{ height: 1, background: "var(--ink-3)", margin: "12px -14px" }} />
            <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>elapsed</div>
            <Meter pct={52} color="var(--signal)" />
          </div>

          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", margin: "16px 0 10px" }}>
            auto-notes this session
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "trap (L) — worse than last week",
              'preference — "that spot" repeated',
              "self-report — HR elevated since race",
            ].map((n, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 10px",
                  background: "var(--ink-2)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "var(--fog-2)",
                  border: "1px solid var(--ink-3)",
                }}
              >
                · {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </WShell>
  );
}
