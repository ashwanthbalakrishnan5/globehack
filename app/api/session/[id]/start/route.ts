import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";
import { transcribe } from "@/lib/elevenlabs";
import { extractNote } from "@/lib/gemini";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const body = await req.json().catch(() => ({}));
  const audioUrl = body.audioUrl as string | undefined;

  const db = insforgeServer();

  await db.database
    .from("sessions")
    .update({ started_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (!audioUrl) {
    return NextResponse.json({ ok: true, sessionId, note: "no audio url, skipping transcription" });
  }

  try {
    const { segments } = await transcribe(audioUrl);

    const clientRes = await db.database
      .from("sessions")
      .select("client_id, protocol_used")
      .eq("id", sessionId)
      .maybeSingle();
    const clientId = (clientRes.data as { client_id: string } | null)?.client_id ?? "marcus-rivera";
    const protocol = (clientRes.data as { protocol_used: string } | null)?.protocol_used ?? "";

    const clientRes2 = await db.database
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .maybeSingle();
    const clientName = (clientRes2.data as { name: string } | null)?.name ?? "Marcus Rivera";

    const batches: typeof segments[] = [];
    for (let i = 0; i < segments.length; i += 4) batches.push(segments.slice(i, i + 4));

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (seg) => {
          const extracted = await extractNote(
            { speaker: seg.speaker, text: seg.text },
            { clientName, sessionProtocol: protocol }
          );
          await db.database.from("session_notes").insert({
            session_id: sessionId,
            speaker: seg.speaker,
            text: seg.text,
            note_type: extracted.note_type,
            quote: extracted.quote,
            rationale: extracted.rationale,
            flagged: extracted.flagged,
            start_sec: seg.start,
            end_sec: seg.end,
          });
        })
      );
    }

    return NextResponse.json({ ok: true, sessionId, segments: segments.length });
  } catch (e) {
    console.error("Transcription failed:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
