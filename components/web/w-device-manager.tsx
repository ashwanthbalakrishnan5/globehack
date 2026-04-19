"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { WShell } from "./shell";
import {
  SESSION_GOALS,
  AI_RECOMMENDED,
  pairDevice,
  type SessionGoal,
  type DeviceProtocol,
  type PairedDevice,
} from "@/lib/mqtt";
import { useDeviceStore } from "@/lib/device-store";

interface Props {
  clientId: string;
  clientName: string;
}

export function WDeviceManager({ clientId, clientName }: Props) {
  const router = useRouter();
  const setDevice = useDeviceStore((s) => s.setDevice);
  const setProtocol = useDeviceStore((s) => s.setProtocol);

  // Pairing state
  const [macInput, setMacInput] = useState("");
  const [pairing, setPairing] = useState(false);
  const [paired, setPaired] = useState<PairedDevice | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);

  // Selection state — default to AI recommendation
  const [selectedGoal, setSelectedGoal] = useState<SessionGoal>(AI_RECOMMENDED.goalId);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(AI_RECOMMENDED.protocolId);

  const currentGoal = SESSION_GOALS.find((g) => g.id === selectedGoal)!;
  const currentProtocol = currentGoal.protocols.find((p) => p.id === selectedProtocolId)
    ?? currentGoal.protocols[0];

  const handlePair = useCallback(async () => {
    const mac = macInput.trim().toUpperCase();
    if (!mac) return;
    setPairing(true);
    setPairError(null);
    try {
      const result = await pairDevice(mac);
      setPaired(result);
      if (!result.verified) {
        setPairError(`Could not reach ${mac} — using demo device as fallback`);
      }
    } catch {
      setPairError("Pairing failed. Using demo device.");
      setPaired({ mac: "74:4D:BD:A0:A3:EC", name: "Hydra-Demo (fallback)", verified: false });
    } finally {
      setPairing(false);
    }
  }, [macInput]);

  const handleGoalSelect = (goalId: SessionGoal) => {
    setSelectedGoal(goalId);
    const goal = SESSION_GOALS.find((g) => g.id === goalId)!;
    setSelectedProtocolId(goal.protocols[0].id);
  };

  const handleBeginSession = useCallback(() => {
    const device = paired ?? { mac: "74:4D:BD:A0:A3:EC", name: "Hydra-Demo", verified: false };
    setDevice(device);
    setProtocol(currentProtocol);
    router.push(`/practitioner/session/${clientId}/live`);
  }, [paired, currentProtocol, clientId, router, setDevice, setProtocol]);

  const isAiGoal = selectedGoal === AI_RECOMMENDED.goalId;
  const isAiProtocol = selectedProtocolId === AI_RECOMMENDED.protocolId;

  return (
    <WShell pageName="today">
      {/* Header */}
      <div
        style={{
          padding: "12px 28px",
          background: "rgba(212,244,90,0.04)",
          borderBottom: "1px solid var(--ink-3)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <span className="mono upper" style={{ fontSize: 10, color: "var(--fog-2)" }}>
          Device Manager · {clientName} · Bay 3
        </span>
        <span style={{ flex: 1 }} />
        <button
          onClick={handleBeginSession}
          style={{
            height: 36,
            padding: "0 20px",
            borderRadius: 8,
            background: "var(--signal)",
            color: "var(--signal-ink)",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--sans)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Begin session →
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Pair a device */}
        <section>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 12 }}>
            available devices
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>

            {/* Paired device card */}
            {paired && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: `1px solid ${paired.verified ? "rgba(212,244,90,0.5)" : "rgba(255,106,61,0.4)"}`,
                  background: paired.verified ? "rgba(212,244,90,0.06)" : "rgba(255,106,61,0.06)",
                  minWidth: 180,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: paired.verified ? "var(--signal)" : "var(--flare)",
                      boxShadow: `0 0 8px ${paired.verified ? "var(--signal)" : "var(--flare)"}`,
                    }}
                  />
                  <div className="mono upper" style={{ fontSize: 8, color: paired.verified ? "var(--signal)" : "var(--flare)" }}>
                    {paired.verified ? "connected" : "fallback"}
                  </div>
                </div>
                <div style={{ fontSize: 15, color: "var(--fog-0)", fontWeight: 600 }}>{paired.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>{paired.mac}</div>
              </motion.div>
            )}

            {/* Pair new device input */}
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                border: "1px dashed var(--ink-4)",
                background: "var(--ink-2)",
                minWidth: 260,
              }}
            >
              <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)", marginBottom: 8 }}>
                pair a new device
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={macInput}
                  onChange={(e) => setMacInput(e.target.value)}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  onKeyDown={(e) => e.key === "Enter" && handlePair()}
                  style={{
                    flex: 1,
                    height: 34,
                    padding: "0 10px",
                    borderRadius: 6,
                    background: "var(--ink-3)",
                    border: "1px solid var(--ink-4)",
                    color: "var(--fog-0)",
                    fontSize: 12,
                    fontFamily: "var(--mono)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handlePair}
                  disabled={pairing || !macInput.trim()}
                  style={{
                    height: 34,
                    padding: "0 14px",
                    borderRadius: 6,
                    background: pairing || !macInput.trim() ? "var(--ink-3)" : "var(--signal)",
                    color: pairing || !macInput.trim() ? "var(--fog-3)" : "var(--signal-ink)",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--sans)",
                    border: "none",
                    cursor: pairing || !macInput.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {pairing ? "Pairing…" : "Pair"}
                </button>
              </div>
              <AnimatePresence>
                {pairError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mono"
                    style={{ fontSize: 10, color: "var(--flare)", marginTop: 6 }}
                  >
                    ⚠ {pairError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* AI recommendation banner */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            background: "linear-gradient(90deg, rgba(212,244,90,0.08), rgba(212,244,90,0.02))",
            border: "1px solid rgba(212,244,90,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(212,244,90,0.12)",
              border: "1px solid rgba(212,244,90,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          <div style={{ flex: 1 }}>
            <div className="mono upper" style={{ fontSize: 9, color: "var(--signal)" }}>
              AI recommended · based on Marcus Rivera's wearable data
            </div>
            <div style={{ fontSize: 13, color: "var(--fog-0)", marginTop: 3 }}>
              {AI_RECOMMENDED.reason}
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedGoal(AI_RECOMMENDED.goalId);
              setSelectedProtocolId(AI_RECOMMENDED.protocolId);
            }}
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 6,
              background: isAiGoal && isAiProtocol ? "var(--signal)" : "rgba(212,244,90,0.12)",
              color: isAiGoal && isAiProtocol ? "var(--signal-ink)" : "var(--signal)",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              border: "1px solid rgba(212,244,90,0.3)",
              cursor: "pointer",
            }}
          >
            {isAiGoal && isAiProtocol ? "✓ Applied" : "Apply"}
          </button>
        </motion.div>

        {/* Session goal selector */}
        <section>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 12 }}>
            choose session goal
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SESSION_GOALS.map((goal) => {
              const active = selectedGoal === goal.id;
              const isAi = goal.id === AI_RECOMMENDED.goalId;
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: active ? "var(--signal)" : "var(--ink-2)",
                    color: active ? "var(--signal-ink)" : "var(--fog-2)",
                    border: active
                      ? "1px solid var(--signal)"
                      : isAi
                        ? "1px solid rgba(212,244,90,0.3)"
                        : "1px solid var(--ink-3)",
                    fontSize: 11,
                    fontWeight: active ? 600 : 400,
                    fontFamily: "var(--sans)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {goal.label}
                  {isAi && !active && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--signal)",
                        border: "1px solid var(--ink-0)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Protocol selector */}
        <section>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 12 }}>
            choose protocol
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {currentGoal.protocols.map((p) => {
              const active = selectedProtocolId === p.id;
              const isAiP = p.id === AI_RECOMMENDED.protocolId && selectedGoal === AI_RECOMMENDED.goalId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProtocolId(p.id)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 10,
                    background: active ? "rgba(212,244,90,0.1)" : "var(--ink-2)",
                    border: active
                      ? "1px solid rgba(212,244,90,0.5)"
                      : isAiP
                        ? "1px solid rgba(212,244,90,0.25)"
                        : "1px solid var(--ink-3)",
                    cursor: "pointer",
                    textAlign: "left",
                    minWidth: 130,
                  }}
                >
                  <div style={{ fontSize: 13, color: active ? "var(--signal)" : "var(--fog-0)", fontWeight: 600 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fog-3)", marginTop: 2 }}>
                    — &ldquo;{p.tagline}&rdquo;
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 4 }}>
                    {p.duration_min} min
                    {isAiP && (
                      <span style={{ color: "var(--signal)", marginLeft: 6 }}>✦ AI pick</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected config summary */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div>
            <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>device</div>
            <div style={{ fontSize: 13, color: "var(--fog-0)", marginTop: 3 }}>
              {paired ? paired.name : "No device paired · will use demo"}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
              {paired ? paired.mac : "74:4D:BD:A0:A3:EC"}
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: "var(--ink-3)" }} />
          <div>
            <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>goal</div>
            <div style={{ fontSize: 13, color: "var(--fog-0)", marginTop: 3 }}>{currentGoal.label}</div>
          </div>
          <div style={{ width: 1, height: 36, background: "var(--ink-3)" }} />
          <div>
            <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>protocol</div>
            <div style={{ fontSize: 13, color: "var(--fog-0)", marginTop: 3 }}>
              {currentProtocol.name} — &ldquo;{currentProtocol.tagline}&rdquo;
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
              {currentProtocol.duration_min} min · {currentProtocol.totalDuration}s total
            </div>
          </div>
          <span style={{ flex: 1 }} />
          <button
            onClick={handleBeginSession}
            style={{
              height: 44,
              padding: "0 28px",
              borderRadius: 10,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Begin session →
          </button>
        </div>
      </div>
    </WShell>
  );
}
