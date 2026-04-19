import { insforgeServer } from "@/lib/insforge";
import type { SessionNote } from "@/lib/types";
import { WLiveSessionLive } from "@/components/web/w-live-session-live";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const db = insforgeServer();

  // Find the most recent session for this client
  const { data: sessions } = await db.database
    .from("sessions")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1);

  const sessionId = (sessions as { id: string }[] | null)?.[0]?.id ?? `session-${clientId}`;

  const { data: notes } = await db.database
    .from("session_notes")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const initialNotes = (notes ?? []) as SessionNote[];

  return (
    <WLiveSessionLive
      sessionId={sessionId}
      clientId={clientId}
      initialNotes={initialNotes}
    />
  );
}
