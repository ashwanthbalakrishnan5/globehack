"use client";

/**
 * Comic Reader — gamified session summary as a 6-panel comic strip.
 * Launched from the summary screen. Tap/swipe to advance panels.
 * Each panel slides in with a comic-book reveal animation.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PANELS = [
  { src: "/comic1.png", alt: "Panel 1" },
  { src: "/comic2.png", alt: "Panel 2" },
  { src: "/comic3.png", alt: "Panel 3" },
  { src: "/comic4.png", alt: "Panel 4" },
  { src: "/comic5.png", alt: "Panel 5" },
  { src: "/comic6.png", alt: "Panel 6" },
];

interface Props {
  onClose: () => void;
}

export function MComicReader({ onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const isLast = current === PANELS.length - 1;

  const advance = useCallback(() => {
    if (isLast) { onClose(); return; }
    setDirection(1);
    setCurrent((c) => c + 1);
  }, [isLast, onClose]);

  const back = useCallback(() => {
    if (current === 0) return;
    setDirection(-1);
    setCurrent((c) => c - 1);
  }, [current]);

  const panel = PANELS[current];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0a0208",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 8px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Panel dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PANELS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === current ? 20 : 6,
                background: i === current ? "#d4f45a" : i < current ? "rgba(212,244,90,0.4)" : "rgba(255,255,255,0.15)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ height: 6, borderRadius: 999 }}
            />
          ))}
        </div>

        <div
          className="mono upper"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", minWidth: 34, textAlign: "right" }}
        >
          {current + 1}/{PANELS.length}
        </div>
      </div>

      {/* Comic panel */}
      <div
        style={{ flex: 1, position: "relative", overflow: "hidden", padding: "8px 16px" }}
        onClick={advance}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0, scale: 0.97 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction * -60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{
              position: "absolute",
              inset: "8px 16px",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,244,90,0.12)",
            }}
          >
            {/* Comic halftone border effect */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                borderRadius: 18,
                border: "3px solid rgba(212,244,90,0.25)",
                pointerEvents: "none",
              }}
            />
            <img
              src={panel.src}
              alt={panel.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Tap hint on first panel */}
            {current === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 1.2, duration: 1.6, repeat: 2 }}
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 0, right: 0,
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(6px)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontFamily: "var(--mono)",
                    letterSpacing: 0.08,
                  }}
                >
                  tap to continue →
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 20px 36px",
          display: "flex",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {current > 0 && (
          <button
            onClick={back}
            style={{
              height: 48, width: 48, borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ←
          </button>
        )}
        <button
          onClick={advance}
          style={{
            flex: 1, height: 48, borderRadius: 12,
            background: isLast ? "var(--signal)" : "rgba(212,244,90,0.12)",
            border: `1px solid ${isLast ? "var(--signal)" : "rgba(212,244,90,0.3)"}`,
            color: isLast ? "var(--signal-ink)" : "var(--signal)",
            fontSize: 14, fontWeight: 600,
            fontFamily: "var(--sans)",
            cursor: "pointer",
          }}
        >
          {isLast ? "Done — back to summary" : `Next panel →`}
        </button>
      </div>
    </motion.div>
  );
}
