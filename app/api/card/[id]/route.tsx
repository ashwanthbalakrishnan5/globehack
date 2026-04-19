import { ImageResponse } from "next/og";
import { insforgeServer } from "@/lib/insforge";
import type { SummaryCard, BodyZoneMap } from "@/lib/types";

export const runtime = "nodejs";

const W = 390;
const H = 693;

const STATUS: Record<string, string> = {
  pain: "#ff4040",
  recovered: "#22c55e",
  active: "#d4f45a",
};
const BASE_COLOR = "rgba(80,130,180,0.22)";

function zc(m: BodyZoneMap, id: string): string {
  const s = m[id];
  return s ? (STATUS[s] ?? BASE_COLOR) : BASE_COLOR;
}

function BodyMap({ zones, label }: { zones: BodyZoneMap; label: string }) {
  function p(id: string, x: number, y: number, w: number, h: number, r = 4) {
    return (
      <div
        style={{
          position: "absolute",
          left: x, top: y, width: w, height: h,
          borderRadius: r,
          background: zc(zones, id),
          display: "flex",
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{
        fontFamily: "Courier New, monospace",
        fontSize: 8,
        letterSpacing: 2,
        color: "rgba(238,241,246,0.38)",
        textTransform: "uppercase",
        marginBottom: 10,
      }}>
        {label}
      </span>
      <div style={{ position: "relative", width: 60, height: 138, display: "flex" }}>
        {p("head", 20, 0, 20, 20, 10)}
        {p("neck", 26, 22, 8, 8, 3)}
        {p("left_shoulder", 37, 22, 16, 12, 6)}
        {p("right_shoulder", 7, 22, 16, 12, 6)}
        {p("chest", 16, 30, 28, 20, 4)}
        {p("left_arm", 47, 34, 10, 30, 5)}
        {p("right_arm", 3, 34, 10, 30, 5)}
        {p("abdomen", 16, 51, 28, 15, 3)}
        {p("lower_back", 16, 67, 28, 12, 3)}
        {p("left_hip", 32, 80, 12, 11, 3)}
        {p("right_hip", 16, 80, 12, 11, 3)}
        {p("left_thigh", 32, 92, 12, 18, 4)}
        {p("right_thigh", 16, 92, 12, 18, 4)}
        {p("left_leg", 32, 112, 12, 16, 4)}
        {p("right_leg", 16, 112, 12, 16, 4)}
        {p("feet", 13, 129, 34, 8, 3)}
      </div>
    </div>
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const db = insforgeServer();
  const { data } = await db.database
    .from("sessions")
    .select("summary_card")
    .eq("id", id)
    .maybeSingle();

  const card = ((data as { summary_card: SummaryCard } | null)?.summary_card) ?? null;
  const quote = card?.quote ?? "Something finally released. I haven't felt this clear in months.";
  const durationMin = card?.duration_min ?? 42;
  const protocol = card?.protocol_used ?? "40 Hz Lymphatic";
  const bodyBefore: BodyZoneMap = card?.body_before ?? {};
  const bodyAfter: BodyZoneMap = card?.body_after ?? {};
  const hasBody = Object.keys(bodyBefore).length > 0 || Object.keys(bodyAfter).length > 0;
  const shortQuote = quote.length > 75 ? quote.slice(0, 75) + "\u2026" : quote;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: "#0a0d14",
          display: "flex",
          flexDirection: "column",
          padding: "32px 28px 26px",
          boxSizing: "border-box",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Ambient glows */}
        <div style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 85% 8%, rgba(212,244,90,0.15) 0%, transparent 48%), radial-gradient(ellipse at 10% 88%, rgba(80,160,210,0.10) 0%, transparent 48%)",
          display: "flex",
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "#d4f45a",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="10" viewBox="0 0 32 20">
                <path d="M2 16 Q 10 4 16 16 T 30 16" stroke="#0a0d14" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span style={{
              fontFamily: "Courier New, monospace",
              fontSize: 13,
              letterSpacing: 2.5,
              color: "#d4f45a",
              textTransform: "uppercase",
            }}>
              Tide
            </span>
          </div>
          <span style={{
            fontFamily: "Courier New, monospace",
            fontSize: 8,
            letterSpacing: 2.5,
            color: "rgba(238,241,246,0.28)",
            textTransform: "uppercase",
          }}>
            Session Summary
          </span>
        </div>

        {/* Practitioner */}
        <div style={{ marginTop: 22, position: "relative", display: "flex", flexDirection: "column" }}>
          <span style={{
            fontFamily: "Courier New, monospace",
            fontSize: 8,
            letterSpacing: 2.5,
            color: "rgba(212,244,90,0.6)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}>
            Session with
          </span>
          <span style={{ fontSize: 19, fontWeight: 700, color: "#eef1f6", letterSpacing: -0.3, lineHeight: 1.15 }}>
            Maya Reyes, DPT
          </span>
          <span style={{ fontSize: 12, color: "rgba(238,241,246,0.42)", marginTop: 3 }}>
            Stillwater Recovery
          </span>
        </div>

        {/* Divider */}
        <div style={{
          marginTop: 18,
          height: 1,
          display: "flex",
          position: "relative",
          background: "linear-gradient(90deg, rgba(212,244,90,0.45), rgba(212,244,90,0.04) 65%, transparent)",
        }} />

        {/* Quote */}
        <div style={{ marginTop: 18, position: "relative", display: "flex", flexDirection: "column" }}>
          <span style={{
            fontFamily: "Courier New, monospace",
            fontSize: 8,
            letterSpacing: 2.5,
            color: "rgba(238,241,246,0.3)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            You said
          </span>
          <span style={{ fontSize: 22, lineHeight: 1.3, color: "#eef1f6", fontStyle: "italic", letterSpacing: -0.2 }}>
            &ldquo;{shortQuote}&rdquo;
          </span>
        </div>

        {/* Body heatmap — only when session data includes body zones */}
        {hasBody && (
          <div style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 28,
            position: "relative",
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <BodyMap zones={bodyBefore} label="Before" />
            <div style={{
              display: "flex",
              alignItems: "center",
              paddingTop: 54,
              color: "rgba(212,244,90,0.45)",
              fontSize: 18,
            }}>
              →
            </div>
            <BodyMap zones={bodyAfter} label="After" />
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Metrics box */}
        <div style={{
          padding: "14px 14px 12px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}>
          <span style={{
            fontFamily: "Courier New, monospace",
            fontSize: 8,
            letterSpacing: 2.5,
            color: "rgba(238,241,246,0.3)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}>
            What changed in {durationMin} min
          </span>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Courier New, monospace", fontSize: 28, color: "#eef1f6", lineHeight: 1 }}>
                <span style={{ color: "#d4f45a" }}>&#8595;</span>11
                <span style={{ fontSize: 12, color: "rgba(238,241,246,0.4)" }}> bpm</span>
              </span>
              <span style={{ fontSize: 11, color: "rgba(238,241,246,0.4)", marginTop: 4 }}>Heart rate drop</span>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.07)", margin: "0 16px", display: "flex" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Courier New, monospace", fontSize: 28, color: "#eef1f6", lineHeight: 1 }}>
                <span style={{ color: "#d4f45a" }}>+</span>18
                <span style={{ fontSize: 12, color: "rgba(238,241,246,0.4)" }}> ms</span>
              </span>
              <span style={{ fontSize: 11, color: "rgba(238,241,246,0.4)", marginTop: 4 }}>HRV improvement</span>
            </div>
          </div>
        </div>

        {/* Protocol pills */}
        <div style={{ marginTop: 10, display: "flex", gap: 8, position: "relative" }}>
          <div style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(212,244,90,0.08)",
            border: "1px solid rgba(212,244,90,0.22)",
            fontFamily: "Courier New, monospace",
            fontSize: 9,
            letterSpacing: 0.5,
            color: "#d4f45a",
            display: "flex",
          }}>
            {protocol}
          </div>
          <div style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            fontFamily: "Courier New, monospace",
            fontSize: 9,
            letterSpacing: 0.5,
            color: "rgba(238,241,246,0.45)",
            display: "flex",
          }}>
            {durationMin} min
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#eef1f6" }}>Start your recovery</span>
            <span style={{
              fontFamily: "Courier New, monospace",
              fontSize: 9,
              color: "rgba(238,241,246,0.32)",
              marginTop: 2,
            }}>
              hydrawav3.com
            </span>
          </div>
          <div style={{
            padding: "8px 16px",
            borderRadius: 9,
            background: "#d4f45a",
            fontSize: 12,
            fontWeight: 700,
            color: "#0a0d14",
            letterSpacing: 0.2,
            display: "flex",
          }}>
            Book now
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
