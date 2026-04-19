import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  const practitionerId = process.env.DEMO_PRACTITIONER_ID ?? "maya-reyes";
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const db = insforgeServer();
  const { data } = await db.database
    .from("sessions")
    .select("id, client_id, started_at")
    .eq("practitioner_id", practitionerId)
    .gte("started_at", since)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ session: data ?? null });
}
