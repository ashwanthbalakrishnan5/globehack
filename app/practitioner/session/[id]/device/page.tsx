import { insforgeServer } from "@/lib/insforge";
import { WDeviceManager } from "@/components/web/w-device-manager";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const db = insforgeServer();

  const { data: clients } = await db.database
    .from("clients")
    .select("name")
    .eq("id", clientId)
    .limit(1);

  const clientName = (clients as { name: string }[] | null)?.[0]?.name ?? clientId;

  return <WDeviceManager clientId={clientId} clientName={clientName} />;
}
