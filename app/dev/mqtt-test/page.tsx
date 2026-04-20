"use client";

import { useState } from "react";
import { AI_RECOMMENDED, SESSION_GOALS } from "@/lib/mqtt";

const AI_PROTOCOL = SESSION_GOALS
  .find((g) => g.id === AI_RECOMMENDED.goalId)!
  .protocols.find((p) => p.id === AI_RECOMMENDED.protocolId)!;

type LogLine = { ts: string; kind: "info" | "ok" | "err"; msg: string };

export default function MqttTestPage() {
  const [mac, setMac] = useState("74:4D:BD:A0:A3:EC");
  const [busy, setBusy] = useState<"start" | "stop" | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);

  const append = (kind: LogLine["kind"], msg: string) =>
    setLog((l) => [{ ts: new Date().toLocaleTimeString(), kind, msg }, ...l].slice(0, 40));

  const call = async (action: "start" | "stop") => {
    const target = mac.trim().toUpperCase();
    if (!target) return;
    setBusy(action);
    append("info", `${action.toUpperCase()} → ${target}`);
    try {
      const body =
        action === "start"
          ? { mac: target, protocol: AI_PROTOCOL }
          : { mac: target };
      const res = await fetch(`/api/device/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) append("ok", `✓ ${action} ok · ${JSON.stringify(json)}`);
      else append("err", `✗ ${action} ${res.status} · ${JSON.stringify(json)}`);
    } catch (e) {
      append("err", `✗ ${action} threw · ${String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        padding: "48px 40px",
        fontFamily: "var(--sans)",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.12 }}>
            dev · mqtt bridge smoke test
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 34, letterSpacing: -0.5, marginTop: 6 }}>
            Real device start / stop
          </div>
          <div style={{ fontSize: 13, color: "var(--fog-2)", marginTop: 8 }}>
            Hits the live MQTT bridge via <span className="mono">/api/device/start</span> and{" "}
            <span className="mono">/api/device/stop</span>. Start publishes the AI-recommended protocol
            (<span className="mono">{AI_PROTOCOL.name}</span> · {AI_PROTOCOL.duration_min} min).
          </div>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 12,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <label className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>
            mac id
          </label>
          <input
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            style={{
              height: 40,
              padding: "0 12px",
              borderRadius: 6,
              background: "var(--ink-3)",
              border: "1px solid var(--ink-4)",
              color: "var(--fog-0)",
              fontSize: 14,
              fontFamily: "var(--mono)",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => call("start")}
              disabled={busy !== null || !mac.trim()}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                background: busy || !mac.trim() ? "var(--ink-3)" : "var(--signal)",
                color: busy || !mac.trim() ? "var(--fog-3)" : "var(--signal-ink)",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: busy || !mac.trim() ? "not-allowed" : "pointer",
              }}
            >
              {busy === "start" ? "Starting…" : "Start"}
            </button>
            <button
              onClick={() => call("stop")}
              disabled={busy !== null || !mac.trim()}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                background: busy || !mac.trim() ? "var(--ink-3)" : "var(--flare)",
                color: busy || !mac.trim() ? "var(--fog-3)" : "#1a0a04",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: busy || !mac.trim() ? "not-allowed" : "pointer",
              }}
            >
              {busy === "stop" ? "Stopping…" : "Stop"}
            </button>
          </div>
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "var(--ink-1)",
            border: "1px solid var(--ink-3)",
            minHeight: 180,
          }}
        >
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 10 }}>
            log
          </div>
          {log.length === 0 ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--fog-3)" }}>
              waiting for first call…
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {log.map((l, i) => (
                <div
                  key={i}
                  className="mono"
                  style={{
                    fontSize: 11,
                    color:
                      l.kind === "ok"
                        ? "var(--signal)"
                        : l.kind === "err"
                          ? "var(--flare)"
                          : "var(--fog-2)",
                  }}
                >
                  <span style={{ color: "var(--fog-3)" }}>{l.ts}</span> {l.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
