// Seed script using native fetch against the Insforge REST API.
// Usage: npm run seed
// Idempotent: all inserts use ON CONFLICT DO UPDATE.

const BASE_URL = process.env.INSFORGE_API_BASE_URL ?? "https://p9y6ygc7.us-west.insforge.app";
const ANON_KEY =
  process.env.INSFORGE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDg2Nzd9.FDEzeD9nrPVrycF0KIW31GrpuxaWcSKsXef3rcT7xOI";

async function upsert(table: string, rows: Record<string, unknown>[], onConflict?: string) {
  const qs = onConflict ? `?on_conflict=${onConflict}` : "";
  const url = `${BASE_URL}/api/database/records/${table}${qs}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upsert into ${table} failed: ${res.status} ${text}`);
  }
  console.log(`  ${table}: ${rows.length} row(s) upserted`);
}

async function main() {
  console.log("Seeding practitioners...");
  await upsert("practitioners", [
    { id: "maya-reyes", name: "Maya Reyes", title: "DPT", clinic: "Stillwater Recovery", email: "maya@stillwater.care" },
  ]);

  console.log("Seeding clients...");
  await upsert("clients", [
    { id: "alina-zhou", practitioner_id: "maya-reyes", name: "Alina Zhou", initials: "AZ", age: 29, profile: "UX designer. Runs 3-4x/week, pickup football on Saturdays, lifts twice a week. First session.", paired_on: "2026-04-18", session_count: 0, next_booked_on: "2026-04-18" },
    { id: "marcus-rivera", practitioner_id: "maya-reyes", name: "Marcus Rivera", initials: "MR", age: 34, profile: "Endurance athlete, marathoner. Declining recovery metrics over 14 days.", paired_on: "2025-10-01", session_count: 7, next_booked_on: "2026-04-18" },
    { id: "sarah-chen", practitioner_id: "maya-reyes", name: "Sarah Chen", initials: "SC", age: 41, profile: "Yoga instructor, stable metrics. Returning after a 6-week break.", paired_on: "2025-09-15", session_count: 5, next_booked_on: "2026-04-18" },
    { id: "jessica-park", practitioner_id: "maya-reyes", name: "Jessica Park", initials: "JP", age: 37, profile: "Post-injury recovery, rotator cuff. Recurring shoulder complaints.", paired_on: "2025-08-20", session_count: 11, next_booked_on: "2026-04-25" },
  ]);

  console.log("Seeding health snapshots (56 rows)...");
  const snapshots = [
    ...([70,72,68,71,69,67,68,65,64,62,60,57,56,58] as const).map((hrv, i) => ({
      client_id: "alina-zhou", captured_on: `2026-04-${String(5+i).padStart(2,"0")}`,
      hrv_ms: hrv, resting_hr_bpm: [58,59,58,60,59,60,61,61,62,63,63,64,64,62][i], sleep_score: [82,80,81,78,79,80,76,72,70,68,62,58,55,64][i],
    })),
    ...([72,70,68,65,63,67,62,60,58,55,58,54,52,50] as const).map((hrv, i) => ({
      client_id: "marcus-rivera", captured_on: `2026-04-${String(5+i).padStart(2,"0")}`,
      hrv_ms: hrv, resting_hr_bpm: [58,59,60,61,62,61,63,63,64,64,63,65,65,66][i], sleep_score: [78,76,74,72,70,71,69,68,65,63,62,60,57,55][i],
    })),
    ...([64,66,65,63,67,65,64,66,65,63,66,65,64,65] as const).map((hrv, i) => ({
      client_id: "sarah-chen", captured_on: `2026-04-${String(5+i).padStart(2,"0")}`,
      hrv_ms: hrv, resting_hr_bpm: [58,57,58,58,57,58,59,57,58,58,57,58,58,57][i], sleep_score: [82,83,81,82,84,82,80,83,82,81,83,82,81,82][i],
    })),
    ...([62,60,59,57,56,54,55,53,52,51,50,49,49,48] as const).map((hrv, i) => ({
      client_id: "jessica-park", captured_on: `2026-04-${String(5+i).padStart(2,"0")}`,
      hrv_ms: hrv, resting_hr_bpm: [65,66,66,67,67,68,67,68,69,69,70,70,70,70][i], sleep_score: [68,67,66,65,63,62,60,58,57,55,53,51,49,48][i],
    })),
  ];
  await upsert("health_snapshots", snapshots, "client_id,captured_on");

  console.log("Seeding sessions (7 rows)...");
  await upsert("sessions", [
    { id: "sarah-session-1", client_id: "sarah-chen", practitioner_id: "maya-reyes", started_at: "2026-03-04T10:00:00Z", ended_at: "2026-03-04T11:00:00Z", protocol_used: "Standard Balance Protocol", transcript_raw: "Maya: How are you feeling today? Sarah: Pretty good, shoulder feels better." },
    { id: "sarah-session-2", client_id: "sarah-chen", practitioner_id: "maya-reyes", started_at: "2026-03-29T10:00:00Z", ended_at: "2026-03-29T11:00:00Z", protocol_used: "Standard Balance Protocol", transcript_raw: "Maya: Great progress this week. Sarah: Yes, I feel more centered after each session." },
    { id: "marcus-session-1", client_id: "marcus-rivera", practitioner_id: "maya-reyes", started_at: "2026-03-04T10:00:00Z", ended_at: "2026-03-04T11:00:00Z", protocol_used: "Parasympathetic Recovery Sequence", transcript_raw: "Maya: How was the marathon prep? Marcus: Good, legs are holding up." },
    { id: "marcus-session-2", client_id: "marcus-rivera", practitioner_id: "maya-reyes", started_at: "2026-03-24T10:00:00Z", ended_at: "2026-03-24T11:00:00Z", protocol_used: "Cooling Emphasis with 40 Hz Lymphatic Vibration", transcript_raw: "Maya: HRV is trending down. Marcus: Yeah, training volume picked up. Left trap is a bit tight." },
    { id: "marcus-session-3", client_id: "marcus-rivera", practitioner_id: "maya-reyes", started_at: "2026-04-11T10:00:00Z", ended_at: "2026-04-11T11:00:00Z", protocol_used: "Cooling Emphasis with 40 Hz Lymphatic Vibration", transcript_raw: "Maya: How is the trap? Marcus: Left trap is worse this week, honestly. And sleep has been rough. Maya: I noticed the HRV drop. We should adjust." },
    { id: "jessica-session-1", client_id: "jessica-park", practitioner_id: "maya-reyes", started_at: "2026-02-27T10:00:00Z", ended_at: "2026-02-27T11:00:00Z", protocol_used: "Warmth Emphasis with Low-Frequency Vibration", transcript_raw: "Maya: How is the shoulder? Jessica: Still sore after PT. The vibration helps though." },
    { id: "jessica-session-2", client_id: "jessica-park", practitioner_id: "maya-reyes", started_at: "2026-03-28T10:00:00Z", ended_at: "2026-03-28T11:00:00Z", protocol_used: "Sun Pad Asymmetric Protocol", transcript_raw: "Maya: The right shoulder is still presenting. Jessica: Yes, the pain has actually gotten worse. I haven't been sleeping well at all." },
  ]);

  console.log("Seeding session_notes (10 rows)...");
  await upsert("session_notes", [
    { id: "note-sarah-s1-1", session_id: "sarah-session-1", speaker: "sarah-chen", text: "Pretty good, shoulder feels better.", note_type: "general", quote: "Shoulder feels better", rationale: "Positive progress update.", flagged: false, start_sec: 8.0, end_sec: 13.0 },
    { id: "note-sarah-s2-1", session_id: "sarah-session-2", speaker: "sarah-chen", text: "I feel more centered after each session.", note_type: "preference", quote: "More centered after each session", rationale: "Client expressing positive response to the protocol.", flagged: false, start_sec: 9.0, end_sec: 14.0 },
    { id: "note-marcus-s1-1", session_id: "marcus-session-1", speaker: "marcus-rivera", text: "Good, legs are holding up.", note_type: "general", quote: "Legs are holding up", rationale: "Baseline status check, no flags.", flagged: false, start_sec: 7.0, end_sec: 10.0 },
    { id: "note-marcus-s2-1", session_id: "marcus-session-2", speaker: "marcus-rivera", text: "Training volume picked up. Left trap is a bit tight.", note_type: "complaint", quote: "Left trap is a bit tight", rationale: "Early trapezius complaint correlating with training load.", flagged: true, start_sec: 15.0, end_sec: 22.0 },
    { id: "note-marcus-s3-1", session_id: "marcus-session-3", speaker: "marcus-rivera", text: "Left trap is worse this week, honestly. And sleep has been rough.", note_type: "complaint", quote: "Left trap is worse this week", rationale: "Escalating trapezius complaint, sleep disruption.", flagged: true, start_sec: 12.0, end_sec: 20.0 },
    { id: "note-marcus-s3-2", session_id: "marcus-session-3", speaker: "marcus-rivera", text: "Sleep has been rough.", note_type: "complaint", quote: "Sleep has been rough", rationale: "Sleep complaint corroborating wearable data.", flagged: false, start_sec: 20.0, end_sec: 24.0 },
    { id: "note-jessica-s1-1", session_id: "jessica-session-1", speaker: "jessica-park", text: "Still sore after PT. The vibration helps though.", note_type: "preference", quote: "The vibration helps", rationale: "Positive protocol response despite soreness.", flagged: false, start_sec: 10.0, end_sec: 16.0 },
    { id: "note-jessica-s1-2", session_id: "jessica-session-1", speaker: "jessica-park", text: "Still sore after PT.", note_type: "complaint", quote: "Still sore after PT", rationale: "Persistent post-PT soreness.", flagged: true, start_sec: 10.0, end_sec: 13.0 },
    { id: "note-jessica-s2-1", session_id: "jessica-session-2", speaker: "jessica-park", text: "Yes, the pain has actually gotten worse.", note_type: "complaint", quote: "The pain has actually gotten worse", rationale: "Escalating shoulder pain.", flagged: true, start_sec: 8.0, end_sec: 18.0 },
    { id: "note-jessica-s2-2", session_id: "jessica-session-2", speaker: "jessica-park", text: "I haven't been sleeping well at all.", note_type: "complaint", quote: "Haven't been sleeping well at all", rationale: "Severe sleep disruption alongside pain escalation.", flagged: true, start_sec: 14.0, end_sec: 18.0 },
  ]);

  console.log("Seeding recommendations (7 rows)...");
  await upsert("recommendations", [
    { id: "rec-sarah-s1", session_id: "sarah-session-1", client_id: "sarah-chen", protocol: "Standard Balance Protocol", parameters: { duration_min: 10, frequency_hz: 30, emphasis: "bilateral" }, reasoning: [{ signal: "HRV", evidence: "Stable at 65ms", mapsTo: "Standard protocol", color: "hrv" }], confidence: "high" },
    { id: "rec-sarah-s2", session_id: "sarah-session-2", client_id: "sarah-chen", protocol: "Standard Balance Protocol", parameters: { duration_min: 10, frequency_hz: 30, emphasis: "bilateral" }, reasoning: [{ signal: "HRV", evidence: "Stable at 65ms", mapsTo: "Standard protocol", color: "hrv" }], confidence: "high" },
    { id: "rec-marcus-s1", session_id: "marcus-session-1", client_id: "marcus-rivera", protocol: "Parasympathetic Recovery Sequence", parameters: { duration_min: 12, frequency_hz: 40, emphasis: "cooling" }, reasoning: [{ signal: "HRV", evidence: "72ms, slight dip", mapsTo: "Extended parasympathetic", color: "hrv" }], confidence: "medium" },
    { id: "rec-marcus-s2", session_id: "marcus-session-2", client_id: "marcus-rivera", protocol: "Cooling Emphasis with 40 Hz Lymphatic Vibration", parameters: { duration_min: 12, frequency_hz: 40, emphasis: "cooling", placement: "bilateral" }, reasoning: [{ signal: "HRV", evidence: "HRV dropped 10%", mapsTo: "Cooling + lymphatic", color: "hrv" }, { signal: "Note", evidence: "Left trap complaint", mapsTo: "Asymmetric pad focus", color: "note" }], confidence: "high" },
    { id: "rec-marcus-s3", session_id: "marcus-session-3", client_id: "marcus-rivera", protocol: "Cooling Emphasis with 40 Hz Lymphatic Vibration", parameters: { duration_min: 12, frequency_hz: 40, emphasis: "cooling", placement: "Sun pad left" }, reasoning: [{ signal: "HRV", evidence: "HRV down 16% over 14 days", mapsTo: "Cooling emphasis", color: "hrv" }, { signal: "RHR", evidence: "RHR elevated 8 bpm", mapsTo: "Extended duration 12 min", color: "hr" }, { signal: "Sleep", evidence: "Sleep below 70 for 5 nights", mapsTo: "Warmth coda + low-frequency", color: "sleep" }, { signal: "Note", evidence: "Left trap complaint flagged", mapsTo: "Sun pad left placement", color: "note" }], confidence: "high" },
    { id: "rec-jessica-s1", session_id: "jessica-session-1", client_id: "jessica-park", protocol: "Warmth Emphasis with Low-Frequency Vibration", parameters: { duration_min: 10, frequency_hz: 20, emphasis: "warmth" }, reasoning: [{ signal: "HRV", evidence: "HRV at 62ms, declining", mapsTo: "Warmth emphasis", color: "hrv" }, { signal: "Note", evidence: "Post-PT soreness", mapsTo: "Low-frequency vibration", color: "note" }], confidence: "medium" },
    { id: "rec-jessica-s2", session_id: "jessica-session-2", client_id: "jessica-park", protocol: "Sun Pad Asymmetric Protocol", parameters: { duration_min: 12, frequency_hz: 20, emphasis: "warmth", placement: "Sun pad right" }, reasoning: [{ signal: "HRV", evidence: "HRV down 11% over 14 days", mapsTo: "Extended duration", color: "hrv" }, { signal: "Note", evidence: "Right shoulder pain flagged", mapsTo: "Sun pad right placement", color: "note" }, { signal: "Sleep", evidence: "Sleep severely disrupted", mapsTo: "Low-frequency parasympathetic", color: "sleep" }], confidence: "high" },
  ]);

  console.log("Seeding relapse_flags (1 row)...");
  await upsert("relapse_flags", [
    { id: "flag-jessica-1", client_id: "jessica-park", practitioner_id: "maya-reyes", severity: "high", reason: "HRV down 23% over 14 days, pain flagged in last 2 sessions, 21 days since last visit", signals: ["HRV trending down 14 consecutive days", "Shoulder pain complaint in sessions on 2026-02-27 and 2026-03-28", "21 days since last appointment (threshold: 14 days)"], addressed: false },
  ]);

  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
