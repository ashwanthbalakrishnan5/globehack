"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MScreen } from "./shell";
import { TideMark } from "@/components/primitives";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--ink-2)",
          color: "var(--fog-3)",
          fontFamily: "var(--mono)",
          fontSize: 12,
        }}
      >
        Preparing camera…
      </div>
    ),
  }
);

function extractToken(raw: string): string | null {
  try {
    const u = new URL(raw);
    const t = u.searchParams.get("token");
    if (t) return t;
  } catch {
    /* not a url, fall through */
  }
  if (raw.startsWith("token=")) return raw.slice(6);
  if (/^[A-Za-z0-9\-_]+$/.test(raw) && raw.length > 10) return raw;
  return null;
}

export function MCheckinScan({
  onToken,
  simulate,
}: {
  onToken: (token: string) => void;
  simulate?: () => void;
}) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const handledRef = useRef(false);

  const handleDetected = (codes: IDetectedBarcode[]) => {
    if (handledRef.current || codes.length === 0) return;
    const raw = codes[0].rawValue;
    const token = extractToken(raw);
    if (!token) return;
    handledRef.current = true;
    onToken(token);
  };

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not available on this device");
      setManualMode(true);
    }
  }, []);

  const submitManual = () => {
    const token = extractToken(manualInput.trim());
    if (token) {
      handledRef.current = true;
      onToken(token);
    }
  };

  return (
    <MScreen pt={32}>
      <div
        style={{
          padding: "20px 20px 0",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 32px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href="/client"
            aria-label="Back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fog-2)",
              fontSize: 18,
              textDecoration: "none",
            }}
          >
            ←
          </Link>
          <div
            className="mono upper"
            style={{ fontSize: 11, color: "var(--fog-2)", letterSpacing: 0.12 }}
          >
            Check in · scan
          </div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="display-lg" style={{ color: "var(--fog-0)" }}>
            Scan the code at the desk.
          </div>
          <div style={{ fontSize: 13, color: "var(--fog-2)", marginTop: 6 }}>
            Point your camera at the QR on Maya&rsquo;s tablet. One session-scoped window opens, only
            for this visit.
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            aspectRatio: "1",
            width: "100%",
            maxWidth: 360,
            alignSelf: "center",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            border: "1px solid var(--ink-3)",
            background: "var(--ink-2)",
            boxShadow: "0 40px 80px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,244,90,0.15)",
          }}
        >
          {manualMode ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                gap: 12,
                textAlign: "center",
              }}
            >
              <TideMark size={46} color="var(--signal)" />
              <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 6 }}>
                enter the code manually
              </div>
              <input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="paste the token or URL"
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 12px",
                  borderRadius: 10,
                  background: "var(--ink-1)",
                  border: "1px solid var(--ink-3)",
                  color: "var(--fog-0)",
                  fontSize: 13,
                  fontFamily: "var(--mono)",
                  outline: "none",
                  textAlign: "center",
                }}
              />
              <button
                type="button"
                onClick={submitManual}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  background: "var(--signal)",
                  color: "var(--signal-ink)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--sans)",
                  cursor: "pointer",
                }}
              >
                Use this code
              </button>
            </div>
          ) : (
            <>
              <Scanner
                onScan={handleDetected}
                onError={(e) => {
                  setCameraError((e as Error)?.message ?? "Camera unavailable");
                }}
                constraints={{ facingMode: "environment" }}
                formats={["qr_code"]}
                scanDelay={300}
                styles={{
                  container: { width: "100%", height: "100%" },
                  video: { width: "100%", height: "100%", objectFit: "cover" },
                }}
                sound={false}
                components={{ finder: false, torch: false, zoom: false }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  position: "absolute",
                  inset: 20,
                  pointerEvents: "none",
                  borderRadius: 18,
                  boxShadow: "0 0 0 9999px rgba(7,9,12,0.55) inset",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 20,
                  borderRadius: 18,
                  pointerEvents: "none",
                }}
              >
                {[
                  { top: 0, left: 0, borderTop: "2px solid var(--signal)", borderLeft: "2px solid var(--signal)" },
                  { top: 0, right: 0, borderTop: "2px solid var(--signal)", borderRight: "2px solid var(--signal)" },
                  { bottom: 0, left: 0, borderBottom: "2px solid var(--signal)", borderLeft: "2px solid var(--signal)" },
                  { bottom: 0, right: 0, borderBottom: "2px solid var(--signal)", borderRight: "2px solid var(--signal)" },
                ].map((p, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      ...p,
                    }}
                  />
                ))}
                <motion.div
                  initial={{ top: "10%" }}
                  animate={{ top: "85%" }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    height: 2,
                    background:
                      "linear-gradient(90deg, transparent, var(--signal), transparent)",
                    boxShadow: "0 0 12px var(--signal)",
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {cameraError && (
            <div className="mono" style={{ fontSize: 11, color: "var(--flare)" }}>
              {cameraError}
            </div>
          )}
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.12 }}>
            hold steady · auto-detects
          </div>
          <button
            type="button"
            onClick={() => setManualMode((v) => !v)}
            style={{
              padding: "6px 12px",
              background: "transparent",
              color: "var(--fog-2)",
              border: "1px solid var(--ink-3)",
              borderRadius: 999,
              fontSize: 11,
              fontFamily: "var(--mono)",
              cursor: "pointer",
            }}
          >
            {manualMode ? "try camera instead" : "enter code manually"}
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {simulate && (
          <div style={{ paddingBottom: 20, display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={simulate}
              style={{
                padding: "8px 16px",
                background: "var(--ink-2)",
                color: "var(--fog-2)",
                border: "1px dashed var(--ink-4)",
                borderRadius: 10,
                fontSize: 11,
                fontFamily: "var(--mono)",
                letterSpacing: 0.12,
                cursor: "pointer",
              }}
            >
              · dev · simulate check-in
            </button>
          </div>
        )}
      </div>
    </MScreen>
  );
}
