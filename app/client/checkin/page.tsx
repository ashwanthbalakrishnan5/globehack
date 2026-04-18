"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MCheckIn } from "@/components/mobile/m-checkin";
import { useSession } from "@/lib/store";
import { ACTIVE_CLIENT_ID } from "@/lib/mock-data";

export default function Page() {
  const phase = useSession((s) => s.phase);
  const summaryReady = useSession((s) => s.summaryReady);
  const startCheckIn = useSession((s) => s.startCheckIn);

  useEffect(() => {
    if (phase === "idle") {
      startCheckIn(ACTIVE_CLIENT_ID, "session-07");
    }
  }, [phase, startCheckIn]);

  if (summaryReady) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <MCheckIn />
        <AutoRedirect to="/client/summary" />
      </div>
    );
  }
  if (phase === "live" || phase === "review") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <MCheckIn />
        <AutoRedirect to="/client/session" />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MCheckIn />
      <div
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          display: "flex",
          gap: 8,
          zIndex: 30,
        }}
      >
        <Link
          href="/client"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "rgba(21,26,32,0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--ink-3)",
            borderRadius: 12,
            color: "var(--fog-0)",
            textDecoration: "none",
            fontFamily: "var(--sans)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Cancel
        </Link>
        <Link
          href="/client/session"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--signal)",
            color: "var(--signal-ink)",
            borderRadius: 12,
            textDecoration: "none",
            fontFamily: "var(--sans)",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Session started →
        </Link>
      </div>
    </div>
  );
}

function AutoRedirect({ to }: { to: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = to;
    }, 600);
    return () => clearTimeout(t);
  }, [to]);
  return null;
}
