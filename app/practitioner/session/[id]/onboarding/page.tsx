import { getClient } from "@/lib/queries";
import { WOnboarding } from "@/components/web/w-onboarding";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);

  return (
    <WOnboarding
      clientId={id}
      clientName={client?.name ?? id}
      clientProfile={client?.profile ?? null}
    />
  );
}
