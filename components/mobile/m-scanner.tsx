"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

interface Props {
  onSuccess?: (sessionId: string) => void;
}

export function MScanner({ onSuccess }: Props) {
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleScan = async (detectedCodes: { rawValue: string }[]) => {
    if (!scanning || detectedCodes.length === 0) return;
    const raw = detectedCodes[0].rawValue;

    let token: string | null = null;
    try {
      const url = new URL(raw);
      token = url.searchParams.get("token");
    } catch {
      return;
    }
    if (!token) return;

    setScanning(false);
    const clientId = process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "marcus-rivera";

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, clientId }),
      });
      const { sessionId, error } = await res.json();
      if (error) { setStatus("error"); setScanning(true); return; }
      setStatus("success");
      onSuccess?.(sessionId);
    } catch {
      setStatus("error");
      setScanning(true);
    }
  };

  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "#000" }}>
      {scanning && (
        <Scanner
          onScan={handleScan}
          styles={{ container: { borderRadius: 18 } }}
        />
      )}
      {status === "success" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(26,39,8,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 40 }}>✓</div>
          <div className="mono upper" style={{ fontSize: 12, color: "var(--signal)" }}>
            Scanned successfully
          </div>
        </div>
      )}
      {status === "error" && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <span className="mono" style={{ fontSize: 11, color: "var(--flare)" }}>
            Invalid QR. Try again.
          </span>
        </div>
      )}
    </div>
  );
}
