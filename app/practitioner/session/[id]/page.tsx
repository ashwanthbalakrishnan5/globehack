import { use } from "react";
import { WContext } from "@/components/web/w-context";
import { getClient, getHealthSnapshots, getRecentSessions } from "@/lib/queries";
import { CheckinInit } from "./checkin-init";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [client, snapshots, sessions] = await Promise.all([
    getClient(id),
    getHealthSnapshots(id, 14),
    getRecentSessions(id, 5),
  ]);

  const priorNotes = sessions.flatMap((s) => []);

  return (
    <>
      <WContext
        clientId={id}
        clientName={client?.name ?? id}
        clientAge={client?.age ?? 34}
        clientProfile={client?.profile ?? ""}
        snapshots={snapshots}
        priorNotes={sessions
          .filter((s) => s.transcript_raw)
          .map((s) => ({
            date: new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            quote: s.transcript_raw?.split(". ").slice(-1)[0] ?? "",
          }))}
      />
      <CheckinInit clientId={id} />
    </>
  );
}
