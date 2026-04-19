"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { subscribeChannel } from "@/lib/realtime";
import { useSession } from "@/lib/store";
import { LoadingButton } from "@/components/primitives";
import { SyncOverlay } from "@/components/sync-overlay";

interface Props {
  open: boolean;
  clientId: string;
  clientName: string;
  onClose: () => void;
}

export function WClientCheckinModal({ open, clientId, clientName, onClose }: Props) {
  const router = useRouter();
  const [tokenUrl, setTokenUrl] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [pending, startTransition] = useTransition();
  const startCheckIn = useSession((s) => s.startCheckIn);
  const navigatedRef = useRef(false);

  const pid = process.env.NEXT_PUBLIC_DEMO_PRACTITIONER_ID ?? "maya-reyes";
  const practitionerName = process.env.NEXT_PUBLIC_DEMO_PRACTITIONER_NAME ?? "Maya";

  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin/token");
      const { token } = await res.json();
      const host = window.location.origin;
      setTokenUrl(`${host}/client/checkin?token=${token}`);
    } catch (e) {
      console.error("token refresh failed", e);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    navigatedRef.current = false;
    setSynced(false);
    refreshToken();
  }, [open, refreshToken]);

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeChannel<{ sessionId: string; clientId: string }>(
      `checkin:${pid}`,
      "checked_in",
      ({ sessionId, clientId: paired }) => {
        if (paired !== clientId || navigatedRef.current) return;
        navigatedRef.current = true;
        startCheckIn(paired, sessionId, "qr");
        setSynced(true);
        setTimeout(() => {
          router.push(`/practitioner/session/${paired}`);
        }, 1500);
      }
    );
    return unsub;
  }, [open, pid, clientId, router, startCheckIn]);

  const handleSimulate = () => {
    if (navigatedRef.current) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        });
        const { sessionId } = await res.json();
        navigatedRef.current = true;
        startCheckIn(clientId, sessionId, "simulated");
        setSynced(true);
        await new Promise((r) => setTimeout(r, 1200));
        router.push(`/practitioner/session/${clientId}`);
        setTimeout(() => {
          fetch("/api/onboarding/health-connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId }),
          }).catch(() => { /* non-fatal for demo */ });
        }, 1400);
      } catch (e) {
        console.error("simulate check-in failed", e);
      }
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(6,8,12,0.78)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(440px, 100%)",
              padding: 28,
              borderRadius: 20,
              background: "var(--ink-1)",
              border: "1px solid var(--ink-3)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--ink-2)",
                border: "1px solid var(--ink-3)",
                color: "var(--fog-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>

            <div style={{ textAlign: "center" }}>
              <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)", letterSpacing: 0.15 }}>
                hand phone to client · or ask to scan
              </div>
              <div className="serif" style={{ fontSize: 22, color: "var(--fog-0)", marginTop: 8, letterSpacing: -0.01 }}>
                Pair for <em style={{ color: "var(--signal)" }}>{clientName}</em>&rsquo;s session
              </div>
            </div>

            {tokenUrl ? (
              <div
                style={{
                  padding: 16,
                  background: "#fff",
                  borderRadius: 14,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <QRCodeCanvas value={tokenUrl} size={240} level="H" />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "rgba(212,244,90,0.8)",
                    boxShadow: "0 0 12px rgba(212,244,90,0.9)",
                    animation: "scan 2s linear infinite",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 272,
                  height: 272,
                  background: "var(--ink-3)",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                  generating secure token…
                </span>
              </div>
            )}

            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", textAlign: "center" }}>
              one-time token · expires in 4 minutes
            </div>

            <LoadingButton
              onClick={handleSimulate}
              pending={pending}
              pendingLabel="pairing…"
              disabled={synced}
              spinnerSize={12}
              style={{
                height: 34,
                padding: "0 18px",
                borderRadius: 8,
                background: "var(--ink-2)",
                color: "var(--fog-1)",
                border: "1px solid var(--ink-3)",
                fontSize: 11,
                fontFamily: "var(--mono)",
                letterSpacing: 0.5,
              }}
            >
              simulate check-in (demo)
            </LoadingButton>

            <SyncOverlay show={synced} name={practitionerName} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
