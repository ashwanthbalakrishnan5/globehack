import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/session-token";
import { insforgeServer } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  const { token, clientId } = await req.json();

  const practitionerId = process.env.DEMO_PRACTITIONER_ID ?? "maya-reyes";

  if (token) {
    const { valid, error } = decodeToken(token);
    if (!valid) {
      return NextResponse.json({ error }, { status: 401 });
    }
  }

  const db = insforgeServer();
  const { data: session, error } = await db.database
    .from("sessions")
    .insert({
      client_id: clientId ?? process.env.DEMO_CLIENT_ID ?? "marcus-rivera",
      practitioner_id: practitionerId,
      started_at: new Date().toISOString(),
      protocol_used: "Cooling Emphasis with 40 Hz Lymphatic Vibration",
    })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sessionId = (session as { id: string } | null)?.id;

  try {
    await db.realtime.connect();
    await db.realtime.subscribe(`checkin:${practitionerId}`);
    await db.realtime.publish(`checkin:${practitionerId}`, "checked_in", {
      sessionId,
      clientId: clientId ?? process.env.DEMO_CLIENT_ID ?? "marcus-rivera",
    });
  } catch (e) {
    console.warn("Realtime publish failed:", e);
  }

  return NextResponse.json({ sessionId });
}
