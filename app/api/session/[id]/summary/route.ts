import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";
import type { BodyZoneMap, Session, SessionNote, SummaryCard } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const payload = (await req.json().catch(() => ({}))) as {
    bodyBefore?: BodyZoneMap;
    bodyAfter?: BodyZoneMap;
  };
  const db = insforgeServer();

  const [{ data: session }, { data: notes }] = await Promise.all([
    db.database.from("sessions").select("*").eq("id", sessionId).maybeSingle(),
    db.database.from("session_notes").select("*").eq("session_id", sessionId).order("created_at", { ascending: true }),
  ]);

  const s = session as Session | null;
  const n = (notes ?? []) as SessionNote[];

  const flaggedNotes = n.filter((note) => note.flagged);
  const quote = flaggedNotes[0]?.quote ?? null;

  const bodyBefore = payload.bodyBefore ?? {};
  const recoveredFromBefore = Object.fromEntries(
    Object.entries(bodyBefore).map(([id, status]) => [id, status === "pain" ? "recovered" : status])
  ) as BodyZoneMap;
  const bodyAfter = payload.bodyAfter && Object.keys(payload.bodyAfter).length
    ? payload.bodyAfter
    : recoveredFromBefore;

  const card: SummaryCard = {
    headline: "Parasympathetic reset, cooling.",
    protocol_used: s?.protocol_used ?? "Cooling Emphasis with 40 Hz Lymphatic Vibration",
    duration_min: 12,
    key_notes: flaggedNotes.slice(0, 3).map((note) => note.quote ?? note.text),
    next_steps: "Continue cooling protocol. Monitor left trap. Schedule follow-up in 7 days.",
    hrv_at_session: 50,
    quote,
    body_before: bodyBefore,
    body_after: bodyAfter,
  };

  await db.database
    .from("sessions")
    .update({ ended_at: new Date().toISOString(), summary_card: card as never })
    .eq("id", sessionId);

  try {
    await db.realtime.connect();
    const clientRes = await db.database.from("sessions").select("client_id").eq("id", sessionId).maybeSingle();
    const clientId = (clientRes.data as { client_id: string } | null)?.client_id ?? "marcus-rivera";
    await db.realtime.subscribe(`summary:${clientId}`);
    await db.realtime.publish(`summary:${clientId}`, "summary_ready", { sessionId, card });
  } catch (e) {
    console.warn("Realtime summary publish failed:", e);
  }

  return NextResponse.json({ ok: true, card });
}
