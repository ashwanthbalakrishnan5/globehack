"use client";

import { use, useEffect } from "react";
import { WContext } from "@/components/web/w-context";
import { useSession } from "@/lib/store";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const startCheckIn = useSession((s) => s.startCheckIn);

  useEffect(() => {
    startCheckIn(id, `session-${Date.now()}`);
  }, [id, startCheckIn]);

  return <WContext />;
}
