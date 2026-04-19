import { WContext } from "@/components/web/w-context";
import { getClient, getHealthSnapshots, getRecentSessions, getRecentNotesForClient } from "@/lib/queries";
import { CheckinInit } from "./checkin-init";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [client, snapshots, sessions, notes] = await Promise.all([
    getClient(id),
    getHealthSnapshots(id, 14),
    getRecentSessions(id, 5),
    getRecentNotesForClient(id, 30),
  ]);

  const displayNotes = sessions
    .filter((s) => s.transcript_raw)
    .map((s) => ({
      date: new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      quote: s.transcript_raw?.split(". ").slice(-1)[0] ?? "",
    }));

  return (
    <>
      <WContext
        clientId={id}
        clientName={client?.name ?? id}
        clientAge={client?.age ?? 34}
        clientProfile={client?.profile ?? ""}
        snapshots={snapshots}
        priorNotes={displayNotes}
        sessionNotes={notes}
      />
      <CheckinInit clientId={id} />
    </>
  );
}
