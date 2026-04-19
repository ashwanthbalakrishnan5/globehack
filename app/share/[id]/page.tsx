import type { Metadata } from "next";
import { insforgeServer } from "@/lib/insforge";
import type { SummaryCard } from "@/lib/types";

async function loadSummary(id: string): Promise<SummaryCard | null> {
  const db = insforgeServer();
  const { data } = await db.database
    .from("sessions")
    .select("summary_card")
    .eq("id", id)
    .maybeSingle();
  return ((data as { summary_card: SummaryCard } | null)?.summary_card) ?? null;
}

function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const card = await loadSummary(id);
  const title = card?.quote ? `"${card.quote}" · Tide session` : "Tide · recovery session";
  const description = card?.protocol_used ?? "Parasympathetic reset, guided by Hydrawav3.";
  const origin = siteOrigin();
  const imageUrl = `${origin}/share/${id}/opengraph-image`;
  const pageUrl = `${origin}/share/${id}`;
  const images = [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: "Tide session summary",
    },
  ];

  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: pageUrl,
      siteName: "Hydrawav3",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await loadSummary(id);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 20%, rgba(212,244,90,0.14), #0a0d14 70%)",
        color: "#e9ecf1",
        fontFamily: "ui-sans-serif, -apple-system, Inter, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.18,
            textTransform: "uppercase",
            color: "rgba(212,244,90,0.85)",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          Tide · session summary
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 34,
            lineHeight: 1.15,
            marginTop: 24,
          }}
        >
          &ldquo;{card?.quote ?? "A quieter nervous system after 40 Hz cooling."}&rdquo;
        </div>
        <div
          style={{
            marginTop: 28,
            padding: 20,
            borderRadius: 18,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Protocol</div>
          <div style={{ fontSize: 18, marginTop: 4 }}>{card?.protocol_used ?? "Cooling Emphasis · 40 Hz"}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 14 }}>
            Duration
          </div>
          <div style={{ fontSize: 18, marginTop: 4 }}>{card?.duration_min ?? 12} min</div>
          {card?.key_notes && card.key_notes.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>What came up</div>
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {card.key_notes.slice(0, 3).map((n, i) => (
                  <li key={i} style={{ fontSize: 14, marginTop: 4 }}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 11,
            letterSpacing: 0.18,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          hydrawav3 · tide recovery intelligence
        </div>
      </div>
    </main>
  );
}
