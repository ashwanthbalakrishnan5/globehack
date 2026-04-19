"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TideMark } from "@/components/primitives";

export function SyncOverlay({
  show,
  name = "Maya",
}: {
  show: boolean;
  name?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(212,244,90,0.22), rgba(11,14,17,0.98))",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            backdropFilter: "blur(6px)",
            pointerEvents: "auto",
          }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 20 }}
            style={{
              width: 104,
              height: 104,
              borderRadius: "50%",
              background: "var(--ink-2)",
              border: "1px solid rgba(212,244,90,0.35)",
              boxShadow: "0 0 80px rgba(212,244,90,0.4), inset 0 0 40px rgba(212,244,90,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TideMark size={52} color="var(--signal)" />
          </motion.div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ textAlign: "center" }}
          >
            <div
              className="mono upper"
              style={{ fontSize: 11, color: "var(--signal)", letterSpacing: 1.4 }}
            >
              paired
            </div>
            <div
              className="serif"
              style={{
                fontSize: 34,
                color: "var(--fog-0)",
                marginTop: 10,
                letterSpacing: -0.02,
              }}
            >
              Synced with <em style={{ color: "var(--signal)" }}>{name}</em>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
