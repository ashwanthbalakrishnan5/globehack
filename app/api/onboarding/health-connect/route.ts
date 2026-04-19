import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

// Realistic 14-day Health Connect payload for Alina Zhou. This stands in for a
// real Android Health Connect bridge during the demo so judges see believable
// activity history, not round-number placeholder data.
const ALINA_PAYLOAD = {
  summary: {
    hrv_ms: 58,
    hrv_baseline: 70,
    resting_hr_bpm: 62,
    resting_hr_baseline: 58,
    sleep_score: 64,
    sleep_hours: 6.2,
    avg_steps: 8420,
  },
  activity_14d: [
    { type: "football", label: "Pickup football", sessions: 2, minutes: 148, avg_hr: 156, max_hr: 181, last_session: "2026-04-12" },
    { type: "running",  label: "Outdoor run",     sessions: 7, minutes: 258, avg_hr: 148, max_hr: 172, last_session: "2026-04-17", last_distance_km: 6.4 },
    { type: "strength", label: "Strength training", sessions: 4, minutes: 180, avg_hr: 118, max_hr: 152, last_session: "2026-04-16" },
    { type: "walk",     label: "Walk",            sessions: 9, minutes: 312, avg_hr: 96,  max_hr: 118, last_session: "2026-04-18" },
  ],
  body: { height_cm: 168, weight_kg: 61.2, gender: "female", age: 29 },
  sleep_14d: [
    { date: "2026-04-05", score: 82, hours: 7.6, deep: 1.4, rem: 1.8 },
    { date: "2026-04-06", score: 80, hours: 7.4, deep: 1.2, rem: 1.7 },
    { date: "2026-04-07", score: 81, hours: 7.5, deep: 1.3, rem: 1.8 },
    { date: "2026-04-08", score: 78, hours: 7.1, deep: 1.1, rem: 1.6 },
    { date: "2026-04-09", score: 79, hours: 7.2, deep: 1.2, rem: 1.6 },
    { date: "2026-04-10", score: 80, hours: 7.3, deep: 1.3, rem: 1.7 },
    { date: "2026-04-11", score: 76, hours: 7.0, deep: 1.0, rem: 1.5 },
    { date: "2026-04-12", score: 72, hours: 6.7, deep: 0.9, rem: 1.4 },
    { date: "2026-04-13", score: 70, hours: 6.5, deep: 0.9, rem: 1.3 },
    { date: "2026-04-14", score: 68, hours: 6.4, deep: 0.8, rem: 1.2 },
    { date: "2026-04-15", score: 62, hours: 5.9, deep: 0.7, rem: 1.0 },
    { date: "2026-04-16", score: 58, hours: 5.6, deep: 0.6, rem: 0.9 },
    { date: "2026-04-17", score: 55, hours: 5.3, deep: 0.6, rem: 0.8 },
    { date: "2026-04-18", score: 64, hours: 6.2, deep: 0.8, rem: 1.1 },
  ],
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const clientId = (body.clientId as string | undefined) ?? process.env.DEMO_CLIENT_ID ?? "alina-zhou";

  const db = insforgeServer();
  const today = new Date().toISOString().slice(0, 10);

  const payload = clientId === "alina-zhou" ? ALINA_PAYLOAD : null;
  const summary = payload?.summary ?? { hrv_ms: 50, resting_hr_bpm: 66, sleep_score: 55 };

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

  const hrv = previous?.hrv_ms ?? summary.hrv_ms;
  const rhr = previous?.resting_hr_bpm ?? summary.resting_hr_bpm;
  const sleep = previous?.sleep_score ?? summary.sleep_score;

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
      payload,
    });
  } catch (e) {
    console.warn("Realtime publish failed:", e);
  }

  return NextResponse.json({
    ok: true,
    clientId,
    hrv_ms: hrv,
    resting_hr_bpm: rhr,
    sleep_score: sleep,
    payload,
  });
}
