import { cache } from "react";
import { insforgeServer } from "./insforge";
import type {
  Client,
  HealthSnapshot,
  Practitioner,
  Recommendation,
  RelapseFlag,
  Session,
  SessionNote,
  Slot,
  Flag,
} from "./types";
import { format } from "date-fns";

const db = () => insforgeServer();

export const getPractitioner = cache(async (id: string): Promise<Practitioner | null> => {
  const { data, error } = await db().database
    .from("practitioners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("getPractitioner", error); return null; }
  return data as Practitioner | null;
});

export const getClient = cache(async (id: string): Promise<Client | null> => {
  const { data, error } = await db().database
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("getClient", error); return null; }
  return data as Client | null;
});

export const getClientsForPractitioner = cache(async (practitionerId: string): Promise<Client[]> => {
  const { data, error } = await db().database
    .from("clients")
    .select("*")
    .eq("practitioner_id", practitionerId);
  if (error) { console.error("getClientsForPractitioner", error); return []; }
  return (data ?? []) as Client[];
});

export const getHealthSnapshots = cache(async (clientId: string, days = 14): Promise<HealthSnapshot[]> => {
  const cutoff = format(new Date(Date.now() - days * 86400000), "yyyy-MM-dd");
  const { data, error } = await db().database
    .from("health_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .gte("captured_on", cutoff)
    .order("captured_on", { ascending: true });
  if (error) { console.error("getHealthSnapshots", error); return []; }
  return (data ?? []) as HealthSnapshot[];
});

export const getRecentSessions = cache(async (clientId: string, limit = 5): Promise<Session[]> => {
  const { data, error } = await db().database
    .from("sessions")
    .select("*")
    .eq("client_id", clientId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("getRecentSessions", error); return []; }
  return (data ?? []) as Session[];
});

export const getSessionWithNotes = cache(async (
  sessionId: string
): Promise<{ session: Session | null; notes: SessionNote[] }> => {
  const [{ data: session, error: se }, { data: notes, error: ne }] = await Promise.all([
    db().database.from("sessions").select("*").eq("id", sessionId).maybeSingle(),
    db().database
      .from("session_notes")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
  ]);
  if (se) console.error("getSession", se);
  if (ne) console.error("getNotes", ne);
  return { session: session as Session | null, notes: (notes ?? []) as SessionNote[] };
});

export const getLatestRecommendation = cache(async (clientId: string): Promise<Recommendation | null> => {
  const { data, error } = await db().database
    .from("recommendations")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error("getLatestRecommendation", error); return null; }
  return data as Recommendation | null;
});

export const getRelapseFlags = cache(async (practitionerId: string): Promise<Flag[]> => {
  const { data: flagRows, error } = await db().database
    .from("relapse_flags")
    .select("*")
    .eq("practitioner_id", practitionerId)
    .eq("addressed", false)
    .order("created_at", { ascending: false });
  if (error) { console.error("getRelapseFlags", error); return []; }

  const rows = (flagRows ?? []) as RelapseFlag[];
  const clientIds = [...new Set(rows.map((r) => r.client_id))];

  const clientMap: Record<string, Client> = {};
  await Promise.all(
    clientIds.map(async (cid) => {
      const c = await getClient(cid);
      if (c) clientMap[cid] = c;
    })
  );

  return rows.map((r) => {
    const client = clientMap[r.client_id];
    return {
      id: r.id,
      clientId: r.client_id,
      clientName: client?.name ?? r.client_id,
      severity: r.severity,
      reason: r.reason,
      signals: r.signals as string[],
      lastVisit: "recent",
      hrvTrend: [62, 60, 58, 56, 54, 52, 50, 48],
    } satisfies Flag;
  });
});

export const getTodaySlots = cache(async (practitionerId: string): Promise<Slot[]> => {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await db().database
    .from("clients")
    .select("*")
    .eq("practitioner_id", practitionerId)
    .eq("next_booked_on", today);
  if (error) { console.error("getTodaySlots", error); return []; }

  const clients = (data ?? []) as Client[];
  return clients.map((c, i) => ({
    time: i === 0 ? "9:00" : "11:30",
    clientId: c.id,
    clientName: c.name,
    clientInitials: c.initials,
    tag: `returning · ${c.session_count}th`,
    readiness: c.id === "marcus-rivera" ? 54 : 82,
    protocol: c.id === "marcus-rivera" ? "Parasympathetic · 40Hz" : "Standard Balance",
    state: (c.id === "marcus-rivera" ? "now" : "done") as "now" | "done" | "soon",
  }));
});
