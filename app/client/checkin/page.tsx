"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MCheckIn } from "@/components/mobile/m-checkin";
import { useSession } from "@/lib/store";

function CheckinHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const phase = useSession((s) => s.phase);
  const summaryReady = useSession((s) => s.summaryReady);
  const startCheckIn = useSession((s) => s.startCheckIn);

  useEffect(() => {
    if (token && phase === "idle") {
      const clientId = process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "marcus-rivera";
      fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, clientId }),
      })
        .then((r) => r.json())
        .then(({ sessionId }) => {
          if (sessionId) startCheckIn(clientId, sessionId, "qr");
        })
        .catch(console.error);
    } else if (!token && phase === "idle") {
      startCheckIn(
        process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "marcus-rivera",
        `session-${Date.now()}`,
        "simulated"
      );
    }
  }, [token, phase, startCheckIn]);

  useEffect(() => {
    if (summaryReady) router.push("/client/summary");
    else if (phase === "live" || phase === "review") router.push("/client/session");
  }, [summaryReady, phase, router]);

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

export default function Page() {
  return (
    <Suspense fallback={<MCheckIn />}>
      <CheckinHandler />
    </Suspense>
  );
}
