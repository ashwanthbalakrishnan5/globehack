import { WToday } from "@/components/web/w-today";
import { getTodaySlots, getRelapseFlags } from "@/lib/queries";

export default async function Page() {
  const practitionerId = process.env.DEMO_PRACTITIONER_ID ?? "maya-reyes";
  const [slots, flags] = await Promise.all([
    getTodaySlots(practitionerId),
    getRelapseFlags(practitionerId),
  ]);
  return <WToday liveSlots={slots} liveFlags={flags} />;
}
