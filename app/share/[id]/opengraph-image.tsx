import { ImageResponse } from "next/og";
import { insforgeServer } from "@/lib/insforge";
import type { SummaryCard } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "Tide session summary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = insforgeServer();
  const { data } = await db.database
    .from("sessions")
    .select("summary_card")
    .eq("id", id)
    .maybeSingle();
  const card = ((data as { summary_card: SummaryCard } | null)?.summary_card) ?? null;

  const quote = card?.quote ?? "Parasympathetic reset, cooling.";
  const protocol = card?.protocol_used ?? "40 Hz Lymphatic";
  const duration = card?.duration_min ?? 12;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0d14",
          color: "#eef1f6",
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glows */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 88% 10%, rgba(212,244,90,0.22) 0%, transparent 45%), radial-gradient(ellipse at 8% 92%, rgba(80,160,210,0.14) 0%, transparent 45%)",
          display: "flex",
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#d4f45a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 22, color: "#0a0d14", fontWeight: 700 }}>~</span>
            </div>
            <span style={{ fontSize: 20, letterSpacing: 4, color: "#d4f45a", textTransform: "uppercase" }}>
              Tide
            </span>
          </div>
          <span style={{ fontSize: 13, letterSpacing: 3, color: "rgba(238,241,246,0.3)", textTransform: "uppercase" }}>
            Session summary
          </span>
        </div>

        {/* Practitioner credit */}
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, letterSpacing: 3, color: "rgba(212,244,90,0.65)", textTransform: "uppercase", marginBottom: 8 }}>
            Session with
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#eef1f6", letterSpacing: -0.5 }}>
            Maya Reyes, DPT · Stillwater Recovery
          </span>
        </div>

        {/* Divider */}
        <div style={{
          marginTop: 32,
          height: 1,
          background: "rgba(212,244,90,0.3)",
          width: "100%",
          display: "flex",
        }} />

        {/* Quote */}
        <div style={{ marginTop: 36, flex: 1, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, letterSpacing: 3, color: "rgba(238,241,246,0.3)", textTransform: "uppercase", marginBottom: 20 }}>
            You said
          </span>
          <span style={{
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            fontSize: 56,
            lineHeight: 1.12,
            maxWidth: 1000,
            color: "#eef1f6",
            display: "flex",
          }}>
            &ldquo;{quote.length > 90 ? quote.slice(0, 90) + "…" : quote}&rdquo;
          </span>
        </div>

        {/* Bottom row */}
        <div style={{
          display: "flex",
          gap: 48,
          alignItems: "center",
          paddingTop: 28,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, letterSpacing: 2, color: "rgba(238,241,246,0.35)", textTransform: "uppercase" }}>
              Protocol
            </span>
            <span style={{ fontSize: 22, marginTop: 6, color: "rgba(238,241,246,0.8)" }}>{protocol}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, letterSpacing: 2, color: "rgba(238,241,246,0.35)", textTransform: "uppercase" }}>
              Duration
            </span>
            <span style={{ fontSize: 22, marginTop: 6, color: "rgba(238,241,246,0.8)" }}>{duration} min</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, letterSpacing: 2, color: "rgba(238,241,246,0.35)", textTransform: "uppercase" }}>
              Heart rate
            </span>
            <span style={{ fontSize: 22, marginTop: 6, color: "#d4f45a" }}>&#8595;11 bpm</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, letterSpacing: 2, color: "rgba(238,241,246,0.35)", textTransform: "uppercase" }}>
              HRV shift
            </span>
            <span style={{ fontSize: 22, marginTop: 6, color: "#d4f45a" }}>+18 ms</span>
          </div>
          <div style={{ flex: 1, display: "flex" }} />
          <div style={{
            padding: "12px 24px",
            borderRadius: 12,
            background: "#d4f45a",
            fontSize: 16,
            fontWeight: 700,
            color: "#0a0d14",
          }}>
            Book now at hydrawav3.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
