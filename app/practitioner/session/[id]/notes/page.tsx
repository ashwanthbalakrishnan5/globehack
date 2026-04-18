"use client";

import { useEffect } from "react";
import { WNotesReview } from "@/components/web/w-notes-review";
import { useSession } from "@/lib/store";

export default function Page() {
  const endLive = useSession((s) => s.endLive);

  useEffect(() => {
    endLive();
  }, [endLive]);

  return <WNotesReview />;
}
