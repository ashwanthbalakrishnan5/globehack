"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MCheckIn } from "@/components/mobile/m-checkin";
import { MCheckinScan } from "@/components/mobile/m-checkin-scan";
import { SyncOverlay } from "@/components/sync-overlay";
import { useSession } from "@/lib/store";

function CheckinHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialToken = searchParams.get("token");
  const [token, setToken] = useState<string | null>(initialToken);
  const [scanCommitted, setScanCommitted] = useState<boolean>(Boolean(initialToken));
  const startCheckIn = useSession((s) => s.startCheckIn);
  const resetDemo = useSession((s) => s.resetDemo);
  const [posting, setPosting] = useState(false);
  const [synced, setSynced] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const practitionerName =
    process.env.NEXT_PUBLIC_DEMO_PRACTITIONER_NAME ?? "Maya";

  // Always reset session phase on mount so the QR scanner shows regardless
  // of what previous demo run left in the Zustand store.
  useEffect(() => {
    resetDemo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runCheckIn = useCallback(
    async (checkinToken?: string) => {
      const clientId = process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "alina-zhou";
      setPosting(true);
      setFailed(null);
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: checkinToken, clientId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFailed(data.error ?? "Could not check in");
          return;
        }
        if (data.sessionId) {
          startCheckIn(clientId, data.sessionId, checkinToken ? "qr" : "simulated");
          setSynced(true);
          setTimeout(() => {
            fetch("/api/onboarding/health-connect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clientId }),
            }).catch(() => { /* non-fatal for demo */ });
          }, 1200);
        }
      } catch (e) {
        setFailed((e as Error).message ?? "Network error");
      } finally {
        setPosting(false);
      }
    },
    [startCheckIn]
  );

  useEffect(() => {
    if (token && !posting && !synced && !failed) {
      runCheckIn(token);
    }
  }, [token, posting, synced, failed, runCheckIn]);

  useEffect(() => {
    if (!synced) return;
    const t = setTimeout(() => router.push("/client/onboarding/session"), 1600);
    return () => clearTimeout(t);
  }, [synced, router]);

  // No longer redirect based on stale phase from a previous run.
  const showScanner = !scanCommitted && !token && !posting && !synced;

  if (showScanner) {
    return (
      <MCheckinScan
        onToken={(t) => {
          setScanCommitted(true);
          setToken(t);
        }}
        simulate={
          process.env.NODE_ENV === "development"
            ? () => {
                setScanCommitted(true);
                runCheckIn();
              }
            : undefined
        }
      />
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
            opacity: synced ? 0.4 : 1,
            pointerEvents: synced ? "none" : "auto",
          }}
        >
          Cancel
        </Link>
        <div
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--signal)",
            color: "var(--signal-ink)",
            borderRadius: 12,
            fontFamily: "var(--sans)",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: posting ? 0.8 : 1,
          }}
        >
          {posting && <Loader2 size={14} className="animate-spin" />}
          {failed
            ? failed
            : posting
            ? `Syncing with ${practitionerName}…`
            : synced
            ? "Paired"
            : "Session started →"}
        </div>
      </div>
      <SyncOverlay show={synced} name={practitionerName} />
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
