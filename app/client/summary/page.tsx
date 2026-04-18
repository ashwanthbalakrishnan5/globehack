"use client";

import { useEffect } from "react";
import { MSummaryExpanded } from "@/components/mobile/m-summary-expanded";
import { useSession } from "@/lib/store";

export default function Page() {
  const resetDemo = useSession((s) => s.resetDemo);

  useEffect(() => {
    // Simulate: once the client has seen the summary, we don't auto-loop the demo.
    // Reset only happens when they close or revoke from settings.
    return () => {
      // leave state as-is so revisits still show the summary
    };
  }, [resetDemo]);

  return <MSummaryExpanded />;
}
