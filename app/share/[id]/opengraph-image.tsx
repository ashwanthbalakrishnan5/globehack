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
  const protocol = card?.protocol_used ?? "Cooling Emphasis · 40 Hz Lymphatic";
  const duration = card?.duration_min ?? 12;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at 28% 18%, rgba(212,244,90,0.24), transparent 55%), radial-gradient(circle at 84% 92%, rgba(80,160,210,0.18), transparent 55%), #0a0d14",
          color: "#eef1f6",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "rgba(212,244,90,0.85)",
            display: "flex",
          }}
        >
          Tide · session
        </div>

        <div
          style={{
            marginTop: 48,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            fontSize: 72,
            lineHeight: 1.08,
            maxWidth: 980,
            display: "flex",
          }}
        >
          &ldquo;{quote.length > 100 ? quote.slice(0, 100) + "…" : quote}&rdquo;
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            gap: 64,
            fontSize: 28,
            color: "rgba(255,255,255,0.72)",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.44)", letterSpacing: 2, textTransform: "uppercase" }}>
              Protocol
            </span>
            <span style={{ marginTop: 10 }}>{protocol}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.44)", letterSpacing: 2, textTransform: "uppercase" }}>
              Duration
            </span>
            <span style={{ marginTop: 10 }}>{duration} min</span>
          </div>
          <div style={{ flex: 1 }} />
          <span
            style={{
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(212,244,90,0.9)",
            }}
          >
            hydrawav3
          </span>
        </div>
      </div>
    ),
    size
  );
}
