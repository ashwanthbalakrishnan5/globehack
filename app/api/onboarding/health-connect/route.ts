import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const clientId = (body.clientId as string | undefined) ?? process.env.DEMO_CLIENT_ID ?? "marcus-rivera";

  const db = insforgeServer();

  const today = new Date().toISOString().slice(0, 10);

  const { data: latest } = await db.database
    .from("health_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .order("captured_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  const previous = latest as {
    hrv_ms?: number;
    resting_hr_bpm?: number;
    sleep_score?: number;
  } | null;

  const hrv = previous?.hrv_ms ?? 50;
  const rhr = previous?.resting_hr_bpm ?? 66;
  const sleep = previous?.sleep_score ?? 55;

  await db.database
    .from("health_snapshots")
    .upsert(
      [
        {
          client_id: clientId,
          captured_on: today,
          hrv_ms: hrv,
          resting_hr_bpm: rhr,
          sleep_score: sleep,
        },
      ],
      { onConflict: "client_id,captured_on" }
    );

  try {
    await db.realtime.connect();
    await db.realtime.subscribe(`onboarding:${clientId}`);
    await db.realtime.publish(`onboarding:${clientId}`, "health_connected", {
      clientId,
      captured_on: today,
      hrv_ms: hrv,
      resting_hr_bpm: rhr,
      sleep_score: sleep,
    });
  } catch (e) {
    console.warn("Realtime publish failed:", e);
  }

  return NextResponse.json({ ok: true, clientId, hrv_ms: hrv, resting_hr_bpm: rhr, sleep_score: sleep });
}
