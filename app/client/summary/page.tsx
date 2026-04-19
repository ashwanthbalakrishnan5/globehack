import { insforgeServer } from "@/lib/insforge";
import type { SummaryCard } from "@/lib/types";
import { MSummaryExpanded } from "@/components/mobile/m-summary-expanded";

export default async function Page() {
  const db = insforgeServer();
  const clientId = process.env.DEMO_CLIENT_ID ?? "marcus-rivera";

  const { data: sessions } = await db.database
    .from("sessions")
    .select("id, summary_card")
    .eq("client_id", clientId)
    .not("summary_card", "is", null)
    .order("ended_at", { ascending: false })
    .limit(1);

  const row = (sessions as { id: string; summary_card: SummaryCard }[] | null)?.[0];
  const card = row?.summary_card ?? null;
  const summaryId = row?.id ?? null;

  return <MSummaryExpanded card={card} summaryId={summaryId} />;
}
