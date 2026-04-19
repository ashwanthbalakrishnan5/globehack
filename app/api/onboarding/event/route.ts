import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

type Segment = {
  start: number;
  end: number;
  speaker: string;
  text: string;
  note_type?: string;
  flagged?: boolean;
  zones?: { id: string; status: "pain" | "recovered" | "active" }[];
};

export async function POST(req: NextRequest) {
  const { clientId, segment } = (await req.json()) as { clientId: string; segment: Segment };
  if (!clientId || !segment) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const db = insforgeServer();
  try {
    await db.realtime.connect();
    await db.realtime.subscribe(`onboarding:${clientId}:notes`);
    await db.realtime.publish(`onboarding:${clientId}:notes`, "segment_played", { segment });

    if (segment.zones && segment.zones.length > 0) {
      await db.realtime.subscribe(`body:${clientId}`);
      await db.realtime.publish(`body:${clientId}`, "zones_updated", {
        source: "onboarding",
        zones: segment.zones,
      });
    }
  } catch (e) {
    console.warn("onboarding publish failed", e);
  }

  return NextResponse.json({ ok: true });
}
