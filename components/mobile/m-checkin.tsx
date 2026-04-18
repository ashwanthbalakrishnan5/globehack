"use client";

import { MScreen } from "./shell";
import { TideMark, RingGauge } from "@/components/primitives";

function QRCode() {
  const size = 21;
  const rand = (x: number, y: number) => {
    const v = Math.sin(x * 374.71 + y * 173.19) * 43758.5;
    return v - Math.floor(v) > 0.5;
  };
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: 2,
        position: "relative",
      }}
    >
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const finder = (cx: number, cy: number) => {
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.max(Math.abs(dx), Math.abs(dy));
          if (r <= 3) return r === 1 ? false : true;
          return null;
        };
        let on: boolean | null = finder(3, 3);
        if (on === null) on = finder(size - 4, 3);
        if (on === null) on = finder(3, size - 4);
        if (on === null) on = rand(x, y);
        return <div key={i} style={{ background: on ? "var(--ink-0)" : "transparent", borderRadius: 1 }} />;
      })}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "var(--ink-0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TideMark size={26} color="var(--signal)" />
      </div>
    </div>
  );
}

export function MCheckIn() {
  return (
    <MScreen pt={54}>
      <div style={{ padding: "24px 28px 0", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>Checking in</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--signal)" }}>● LIVE</span>
        </div>
        <div style={{ marginTop: 28 }}>
          <div className="display-xl">Show this at the desk.</div>
          <div style={{ fontSize: 14, color: "var(--fog-2)", marginTop: 8 }}>Session #07 with Maya · Bay 3</div>
        </div>
        <div
          style={{
            marginTop: 32,
            aspectRatio: "1",
            background: "var(--fog-0)",
            borderRadius: 28,
            padding: 20,
            position: "relative",
            boxShadow: "0 40px 80px -20px rgba(212,244,90,0.25), 0 0 0 1px var(--ink-3)",
          }}
        >
          <QRCode />
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              height: 2,
              background: "linear-gradient(90deg, transparent, var(--signal), transparent)",
              animation: "scan 2.5s ease-in-out infinite",
              boxShadow: "0 0 20px var(--signal)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            Granting to Maya
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <RingGauge size={42} pct={72} stroke={4} color="var(--hrv)" />
            <div style={{ flex: 1 }}>
              <div className="mono tnum" style={{ fontSize: 18, color: "var(--fog-0)" }}>
                72 <span style={{ fontSize: 10, color: "var(--fog-3)" }}>ms HRV</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>↓ 18% vs baseline</div>
            </div>
            <div style={{ width: 1, height: 30, background: "var(--ink-3)" }} />
            <div>
              <div className="mono tnum" style={{ fontSize: 18, color: "var(--fog-0)" }}>5h 42m</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>sleep · last night</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", textAlign: "center", paddingBottom: 32 }}>
          Token expires in 4m 58s · revoke anytime
        </div>
      </div>
    </MScreen>
  );
}
