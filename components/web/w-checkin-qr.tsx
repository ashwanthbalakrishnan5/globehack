"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { subscribeChannel } from "@/lib/realtime";
import { useSession } from "@/lib/store";
import { SyncOverlay } from "@/components/sync-overlay";

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

  useEffect(() => {
    const unsub = subscribeChannel<{ sessionId: string; clientId: string }>(
      `checkin:${pid}`,
      "checked_in",
      ({ sessionId, clientId }) => {
        startCheckIn(clientId, sessionId, "qr");
        setSynced(true);
        setTimeout(() => {
          router.push(`/practitioner/session/${clientId}`);
        }, 1500);
      }
    );
    return unsub;
  }, [pid, router, startCheckIn]);

  const handleSimulate = () => {
    startTransition(async () => {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "marcus-rivera" }),
      });
      const { sessionId } = await res.json();
      startCheckIn("marcus-rivera", sessionId, "simulated");
      setSynced(true);
      await new Promise((r) => setTimeout(r, 1500));
      router.push(`/practitioner/session/marcus-rivera`);
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
        <button
          onClick={handleSimulate}
          disabled={pending || synced}
          style={{
            height: 28,
            padding: "0 14px",
            borderRadius: 6,
            background: "var(--ink-3)",
            color: "var(--fog-2)",
            border: "1px solid var(--ink-4)",
            fontSize: 10,
            fontFamily: "var(--mono)",
            cursor: pending || synced ? "wait" : "pointer",
            letterSpacing: 0.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            opacity: pending || synced ? 0.75 : 1,
          }}
        >
          {pending && <Loader2 size={10} className="animate-spin" />}
          {pending ? "pairing..." : "dev · simulate check-in"}
        </button>
      )}
      <SyncOverlay show={synced} name={practitionerName} />
    </div>
  );
}
