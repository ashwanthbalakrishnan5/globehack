"use client";

import { useEffect } from "react";
import { WLiveSession } from "@/components/web/w-live-session";
import { useSession } from "@/lib/store";

export default function Page() {
  const startLive = useSession((s) => s.startLive);

  useEffect(() => {
    startLive();
  }, [startLive]);

  return <WLiveSession />;
}
