"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MSessionLive } from "@/components/mobile/m-session-live";
import { useSession } from "@/lib/store";

export default function Page() {
  const router = useRouter();
  const summaryReady = useSession((s) => s.summaryReady);

  useEffect(() => {
    if (!summaryReady) return;
    const t = setTimeout(() => router.replace("/client/summary"), 400);
    return () => clearTimeout(t);
  }, [summaryReady, router]);

  return <MSessionLive />;
}
