"use client";

import { BioGrid, TideMark } from "@/components/primitives";
import { IOSStatusBar } from "@/components/frames/ios-device";

export function MLockscreenCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(180deg, rgba(7,9,12,0.1) 0%, rgba(7,9,12,0.7) 50%, rgba(7,9,12,0.95) 100%),
                     radial-gradient(ellipse at 30% 20%, #2a3d2a 0%, #0c1410 40%, #07090c 80%)`,
        color: "var(--fog-0)",
        fontFamily: "var(--sans)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,244,90,0.35), transparent 60%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(111,184,255,0.2), transparent 60%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
          <path d="M3 7V5a4 4 0 118 0v2M2 7h10v7H2V7z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
        </svg>
        <div className="mono upper" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          Thursday · April 17
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 84,
          fontWeight: 200,
          letterSpacing: -3,
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1,
        }}
      >
        3:42
      </div>
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 180 }}>
        <div
          style={{
            borderRadius: 22,
            padding: 16,
            position: "relative",
            overflow: "hidden",
            background: "rgba(30, 38, 22, 0.68)",
            backdropFilter: "blur(40px) saturate(160%)",
            WebkitBackdropFilter: "blur(40px) saturate(160%)",
            border: "1px solid rgba(212,244,90,0.18)",
          }}
        >
          <BioGrid color="rgba(212,244,90,0.08)" size={18} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "var(--signal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TideMark size={14} color="var(--signal-ink)" animate={false} />
            </div>
            <div className="mono upper" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", flex: 1 }}>
              Tide · just now
            </div>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>Session 07</div>
          </div>
          <div className="serif" style={{ marginTop: 14, fontSize: 24, lineHeight: 1.2, color: "#fff", fontStyle: "italic" }}>
            &ldquo;Left trap is <span style={{ color: "var(--signal)" }}>worse</span> this week.&rdquo;
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            — you, at minute 14
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "16px 0" }} />
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div className="mono tnum" style={{ fontSize: 22, color: "#fff", lineHeight: 1 }}>
                <span style={{ color: "var(--signal)" }}>↓</span> 11{" "}
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>BPM</span>
              </div>
              <div className="mono upper" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                heart rate · in 42 min
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ flex: 1 }}>
              <div className="mono tnum" style={{ fontSize: 22, color: "#fff", lineHeight: 1 }}>
                <span style={{ color: "var(--signal)" }}>+</span> 18
                <span style={{ fontSize: 14 }}>ms</span>
              </div>
              <div className="mono upper" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                HRV shift
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "10px 0 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="mono upper" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
              Slide to share · tap to open
            </span>
            <span style={{ color: "var(--signal)", fontSize: 16 }}>→</span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 70,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(20px)",
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar dark={true} />
      </div>
    </div>
  );
}
