import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/session-token";
import { insforgeServer } from "@/lib/insforge";

const DEMO_PRACTITIONER = {
  id: "maya-reyes",
  name: "Maya Reyes",
  title: "DPT",
  clinic: "Stillwater Recovery",
  email: "maya@stillwater.care",
};

const DEMO_CLIENT = {
  id: "alina-zhou",
  practitioner_id: "maya-reyes",
  name: "Alina Zhou",
  initials: "AZ",
  age: 29,
  profile:
    "UX designer. Runs 3-4x/week, pickup football on Saturdays, lifts twice a week. First session.",
  paired_on: "2026-04-18",
  session_count: 0,
  next_booked_on: "2026-04-18",
};

export async function POST(req: NextRequest) {
  const { token, clientId: rawClientId } = await req.json();

  const practitionerId = process.env.DEMO_PRACTITIONER_ID ?? DEMO_PRACTITIONER.id;
  const clientId = rawClientId ?? process.env.DEMO_CLIENT_ID ?? DEMO_CLIENT.id;

  if (token) {
    const { valid, error } = decodeToken(token);
    if (!valid) {
      return NextResponse.json({ error }, { status: 401 });
    }
  }

  const db = insforgeServer();
  const isSimulated = !token;

  // Self-heal demo rows only on real QR scan (upserts are slow; simulate assumes seeded data).
  if (!isSimulated) {
    try {
      await db.database
        .from("practitioners")
        .upsert(
          [{ ...DEMO_PRACTITIONER, id: practitionerId }],
          { onConflict: "id" }
        );
      await db.database
        .from("clients")
        .upsert(
          [{ ...DEMO_CLIENT, id: clientId, practitioner_id: practitionerId }],
          { onConflict: "id" }
        );
    } catch (e) {
      console.warn("Check-in parent upsert failed:", e);
    }
  }

  const { data: session, error } = await db.database
    .from("sessions")
    .insert({
      client_id: clientId,
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

  // Realtime publish only needed for real QR flow; simulate navigates directly.
  if (!isSimulated) {
    try {
      await db.realtime.connect();
      await db.realtime.subscribe(`checkin:${practitionerId}`);
      await db.realtime.publish(`checkin:${practitionerId}`, "checked_in", {
        sessionId,
        clientId,
      });
    } catch (e) {
      console.warn("Realtime publish failed:", e);
    }
  }

  return NextResponse.json({ sessionId });
}
