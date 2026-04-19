import { WRelapseFlag } from "@/components/web/w-relapse";
import {
  getClientsForPractitioner,
  getHealthSnapshots,
  getRecentNotesForClient,
  getRecentSessions,
} from "@/lib/queries";
import { computeRelapseFlag } from "@/lib/relapse-rules";
import type { Flag } from "@/lib/types";

const badgeColorName = (s: "low" | "medium" | "high") => s;

export default async function Page() {
  const practitionerId = process.env.DEMO_PRACTITIONER_ID ?? "maya-reyes";
  const clients = await getClientsForPractitioner(practitionerId);

  const today = Date.now();
  const computed = await Promise.all(
    clients.map(async (c) => {
      const [snapshots, notes, sessions] = await Promise.all([
        getHealthSnapshots(c.id, 14),
        getRecentNotesForClient(c.id, 30),
        getRecentSessions(c.id, 3),
      ]);
      const last = sessions[0]?.started_at
        ? new Date(sessions[0].started_at).getTime()
        : 0;
      const daysSinceLastVisit = last
        ? Math.floor((today - last) / 86400000)
        : 999;
      const result = computeRelapseFlag(snapshots, notes, daysSinceLastVisit);
      if (!result.severity) return null;
      const hrvTrend = snapshots.slice(-8).map((s) => Math.round(Number(s.hrv_ms)));
      const flag: Flag = {
        id: `flag-${c.id}`,
        clientId: c.id,
        clientName: c.name,
        severity: result.severity,
        reason: result.reason,
        signals: result.signals,
        lastVisit: last
          ? new Date(last).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "unknown",
        hrvTrend,
      };
      return flag;
    })
  );

  const severityRank = { high: 0, medium: 1, low: 2 } as const;
  const flags = computed
    .filter((f): f is Flag => f !== null)
    .sort((a, b) => severityRank[badgeColorName(a.severity)] - severityRank[badgeColorName(b.severity)]);

  return <WRelapseFlag liveFlags={flags} />;
}
