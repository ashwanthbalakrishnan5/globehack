import Link from "next/link";
import { TideMark } from "@/components/primitives";

const PALETTE = [
  { n: "signal", h: "#d4f45a", d: "phosphor · the primary action" },
  { n: "signal-dim", h: "#8ba63a", d: "signal on signal" },
  { n: "flare", h: "#ff6a3d", d: "asymmetry · heat" },
  { n: "spark", h: "#ffd36a", d: "attention" },
  { n: "cool", h: "#6fb8ff", d: "cold · parasympathetic" },
  { n: "lymph", h: "#c07bff", d: "40Hz lymphatic" },
  { n: "hrv", h: "#7de0c2", d: "HRV data" },
  { n: "hr", h: "#ff8a80", d: "heart rate" },
  { n: "sleep", h: "#8aa4ff", d: "sleep" },
  { n: "ink-0", h: "#07090c", d: "page" },
  { n: "ink-1", h: "#0e1216", d: "panel" },
  { n: "ink-2", h: "#151a20", d: "card" },
  { n: "ink-3", h: "#1d242c", d: "raised" },
  { n: "ink-4", h: "#2a333d", d: "line" },
  { n: "fog-0", h: "#f8f7f3", d: "text primary" },
  { n: "fog-2", h: "#b9b5a8", d: "text secondary" },
  { n: "fog-3", h: "#7c786d", d: "text muted" },
  { n: "bone-0", h: "#f4efe6", d: "warm paper" },
];

const PRINCIPLES: [string, string][] = [
  ["Signal is sacred", "Only phosphor green = the thing worth paying attention to. Never decorative."],
  ["Numbers are first-class", "Biodata = mono · tabular nums. Reads as instrument, not infographic."],
  ["Quotes are hero", "The thing the client said goes in serif italic, at the largest scale."],
  ["Dark is baseline", "Reflects practice lighting. Lockscreen dark keeps the card honest."],
  ["No slop", "No illustrated icons. No gradient surfaces. Edges are glow or 1px, nothing between."],
];

export default function DesignSystemPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--ink-0)", color: "var(--fog-0)" }}>
      <div
        style={{
          padding: "48px 60px 28px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--ink-3)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <TideMark size={28} />
            <div style={{ fontFamily: "var(--serif)", fontSize: 52, letterSpacing: -1, lineHeight: 1 }}>
              Tide design system
            </div>
          </div>
          <div
            className="mono upper"
            style={{ fontSize: 11, color: "var(--fog-3)", letterSpacing: 0.12 }}
          >
            v0.1 · companion layer for Hydrawav3 · globehack 2026
          </div>
        </div>
        <Link
          href="/"
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "1px solid var(--ink-3)",
            color: "var(--fog-0)",
            fontSize: 13,
            fontFamily: "var(--sans)",
            textDecoration: "none",
          }}
        >
          ← back to canvas
        </Link>
      </div>

      <div
        style={{
          padding: "32px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        <section>
          <div className="mono upper" style={{ fontSize: 11, color: "var(--fog-3)", marginBottom: 18 }}>
            palette
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {PALETTE.map((c) => (
              <div
                key={c.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--ink-2)",
                  border: "1px solid var(--ink-3)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: c.h,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--fog-0)" }}>
                    {c.n}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
                    {c.h} · {c.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mono upper" style={{ fontSize: 11, color: "var(--fog-3)", marginBottom: 18 }}>
            typography
          </div>
          <div
            style={{
              padding: 22,
              borderRadius: 14,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              marginBottom: 16,
            }}
          >
            <div className="display-xl" style={{ color: "var(--fog-0)" }}>
              &ldquo;Left trap is <em>worse</em> this week.&rdquo;
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 10 }}>
              Instrument Serif · 40 · display-xl · hero quotes
            </div>
          </div>
          <div
            style={{
              padding: 18,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              marginBottom: 12,
            }}
          >
            <div style={{ fontFamily: "var(--sans)", fontSize: 22, fontWeight: 500 }}>
              Inter Tight · body &amp; UI
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 6 }}>
              300–600 · labels, buttons, captions
            </div>
          </div>
          <div
            style={{
              padding: 18,
              borderRadius: 12,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
            }}
          >
            <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)" }}>
              72 ms · 64 bpm · ↓ 11
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 6 }}>
              JetBrains Mono · numerics · tabular nums
            </div>
          </div>
        </section>

        <section style={{ gridColumn: "1 / -1" }}>
          <div className="mono upper" style={{ fontSize: 11, color: "var(--fog-3)", marginBottom: 18 }}>
            principles
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {PRINCIPLES.map(([h, b]) => (
              <div
                key={h}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "var(--ink-2)",
                  border: "1px solid var(--ink-3)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{h}</div>
                <div style={{ fontSize: 12, color: "var(--fog-2)", marginTop: 6, lineHeight: 1.5 }}>
                  {b}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ gridColumn: "1 / -1" }}>
          <div className="mono upper" style={{ fontSize: 11, color: "var(--fog-3)", marginBottom: 18 }}>
            shorthand
          </div>
          <div
            style={{
              padding: 18,
              borderRadius: 12,
              background: "var(--ink-1)",
              border: "1px solid var(--ink-3)",
              fontSize: 13,
              color: "var(--fog-2)",
              lineHeight: 1.7,
            }}
          >
            Signal on deep ink. Serif italic for the one phrase that matters. Mono for every number.
            Edges are a single pixel or a phosphor glow, never a gradient. Wellness language only:
            supports, empowers, enhances — never cures, treats, heals. Brand is spelled Hydrawav3
            with a lowercase w and the numeral 3.
          </div>
        </section>
      </div>
    </div>
  );
}
