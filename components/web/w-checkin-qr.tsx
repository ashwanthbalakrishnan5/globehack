"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import { subscribeChannel } from "@/lib/realtime";
import { useSession } from "@/lib/store";
import { SyncOverlay } from "@/components/sync-overlay";
import { LoadingButton } from "@/components/primitives";

export function WCheckinQR({ practitionerId }: { practitionerId?: string }) {
  const [tokenUrl, setTokenUrl] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const startCheckIn = useSession((s) => s.startCheckIn);
  const pid = practitionerId ?? process.env.NEXT_PUBLIC_DEMO_PRACTITIONER_ID ?? "maya-reyes";
  const practitionerName =
    process.env.NEXT_PUBLIC_DEMO_PRACTITIONER_NAME ?? "Maya";

  const refreshToken = useCallback(async () => {
    const res = await fetch("/api/checkin/token");
    const { token } = await res.json();
    const host = window.location.origin;
    setTokenUrl(`${host}/client/checkin?token=${token}`);
  }, []);

  useEffect(() => {
    refreshToken();
    const interval = setInterval(refreshToken, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken]);

  const syncedRef = useRef(false);

  const handleCheckedIn = useCallback((clientId: string, sessionId: string) => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    startCheckIn(clientId, sessionId, "qr");
    setSynced(true);
    setTimeout(() => {
      router.push(`/practitioner/session/${clientId}`);
    }, 1500);
  }, [startCheckIn, router]);

  // Realtime subscription
  useEffect(() => {
    const unsub = subscribeChannel<{ sessionId: string; clientId: string }>(
      `checkin:${pid}`,
      "checked_in",
      ({ sessionId, clientId }) => handleCheckedIn(clientId, sessionId)
    );
    return unsub;
  }, [pid, handleCheckedIn]);

  // Polling fallback: queries for a new session every 2s in case realtime misses it
  useEffect(() => {
    const mountedAt = new Date();
    const poll = setInterval(async () => {
      if (syncedRef.current) { clearInterval(poll); return; }
      try {
        const res = await fetch("/api/checkin/latest");
        const { session } = await res.json();
        if (session && new Date(session.started_at) >= mountedAt) {
          handleCheckedIn(session.client_id, session.id);
        }
      } catch { /* non-fatal */ }
    }, 2000);
    return () => clearInterval(poll);
  }, [handleCheckedIn]);

  const handleSimulate = () => {
    startTransition(async () => {
      const demoId = process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "alina-zhou";
      syncedRef.current = true;
      setSynced(true);
      fetch("/api/onboarding/health-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: demoId }),
      }).catch(() => { /* non-fatal for demo */ });
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: demoId }),
      });
      const { sessionId } = await res.json();
      startCheckIn(demoId, sessionId, "simulated");
      router.push(`/practitioner/session/${demoId}`);
    });
  };

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: "var(--ink-2)",
        border: "1px solid var(--ink-3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
        client check-in · scan with phone
      </div>
      {tokenUrl ? (
        <div
          style={{
            padding: 12,
            background: "#fff",
            borderRadius: 10,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <QRCodeCanvas value={tokenUrl} size={220} level="H" />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              background: "rgba(212,244,90,0.7)",
              animation: "scan 2s linear infinite",
              boxShadow: "0 0 8px rgba(212,244,90,0.8)",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 244,
            height: 244,
            background: "var(--ink-3)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>generating...</span>
        </div>
      )}
      <div className="mono" style={{ fontSize: 9, color: "var(--fog-3)", textAlign: "center" }}>
        refreshes every 4 min · valid once
      </div>
      {process.env.NODE_ENV === "development" && (
        <LoadingButton
          onClick={handleSimulate}
          pending={pending}
          pendingLabel="pairing…"
          disabled={synced}
          spinnerSize={10}
          style={{
            height: 28,
            padding: "0 14px",
            borderRadius: 6,
            background: "var(--ink-3)",
            color: "var(--fog-2)",
            border: "1px solid var(--ink-4)",
            fontSize: 10,
            fontFamily: "var(--mono)",
            letterSpacing: 0.5,
          }}
        >
          dev · simulate check-in
        </LoadingButton>
      )}
      <SyncOverlay show={synced} name={practitionerName} />
    </div>
  );
}
