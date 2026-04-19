"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MScreen } from "./shell";
import { subscribeChannel } from "@/lib/realtime";
import { useBodyState, EMPTY_ZONES } from "@/lib/body-state";
import { useSession } from "@/lib/store";
import type { BodyPartStatus } from "@/components/features/body-viewer";

const BodyViewer = dynamic(() => import("@/components/features/body-viewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 60%, rgba(212,244,90,0.12), #0a0d14 70%)",
      }}
    />
  ),
});

function useElapsedTimer(startedAt: number | null): string {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MSessionLive() {
  const clientId = useSession((s) => s.activeClientId) ?? process.env.NEXT_PUBLIC_DEMO_CLIENT_ID ?? "marcus-rivera";
  const liveStartedAt = useSession((s) => s.liveStartedAt);
  const zones = useBodyState((s) => s.zones[clientId] ?? EMPTY_ZONES);
  const mergeZones = useBodyState((s) => s.mergeZones);
  const elapsed = useElapsedTimer(liveStartedAt);

  useEffect(() => {
    const unsub = subscribeChannel<{ zones: { id: string; status: BodyPartStatus }[] }>(
      `body:${clientId}`,
      "zones_updated",
      ({ zones: incoming }) => {
        if (incoming?.length) mergeZones(clientId, incoming);
      }
    );
    return unsub;
  }, [clientId, mergeZones]);

  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono upper" style={{ fontSize: 10, color: "var(--signal)" }}>◉ Session live</div>
            <div className="mono tnum" style={{ fontSize: 28, color: "var(--fog-0)", marginTop: 2, fontWeight: 300 }}>
              {liveStartedAt ? elapsed : "—:——"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>Protocol</div>
            <div style={{ fontSize: 14, color: "var(--fog-0)", marginTop: 2 }}>Parasympathetic</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>40Hz · cool</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            height: 300,
            borderRadius: 20,
            border: "1px solid var(--ink-3)",
            background: "var(--ink-1)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <BodyViewer markedParts={zones} />
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 16,
              right: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              pointerEvents: "none",
            }}
          >
            <div>
              <div className="mono tnum" style={{ fontSize: 22, color: "var(--fog-0)" }}>84</div>
              <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>BPM · now</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono tnum" style={{ fontSize: 22, color: "var(--signal)" }}>↓ 11</div>
              <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>since start</div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1px solid var(--signal)",
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--signal)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--fog-0)" }}>Listening in the background</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
              On-device · transcribed in real time
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingBottom: 32 }}>
          <Link
            href="/client/summary"
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              background: "transparent",
              color: "var(--fog-0)",
              border: "1px solid var(--ink-4)",
              fontSize: 15,
              fontFamily: "var(--sans)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            End session
          </Link>
        </div>
      </div>
    </MScreen>
  );
}
