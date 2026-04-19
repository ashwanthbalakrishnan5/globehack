import { insforgeServer } from "@/lib/insforge";
import type { SummaryCard } from "@/lib/types";
import { MSummaryExpanded } from "@/components/mobile/m-summary-expanded";

export default async function Page() {
  const db = insforgeServer();
  const clientId = process.env.DEMO_CLIENT_ID ?? "marcus-rivera";

  const { data: sessions } = await db.database
    .from("sessions")
    .select("summary_card")
    .eq("client_id", clientId)
    .not("summary_card", "is", null)
    .order("ended_at", { ascending: false })
    .limit(1);

  const card = ((sessions as { summary_card: SummaryCard }[] | null)?.[0]?.summary_card) ?? null;

  return <MSummaryExpanded card={card} />;
}
