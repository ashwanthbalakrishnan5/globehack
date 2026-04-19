"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { draftMessage } from "@/lib/draft-message";
import type { Flag } from "@/lib/types";

interface Props {
  flag: Flag | null;
  onClose: () => void;
}

export function WDraftMessageDrawer({ flag, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [contacted, setContacted] = useState(false);

  const draft = flag ? draftMessage({ name: flag.clientName }, flag) : null;

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleContacted = async () => {
    if (!flag) return;
    await fetch(`/api/flags/${flag.id}`, { method: "PATCH" }).catch(console.error);
    setContacted(true);
    setTimeout(() => { setContacted(false); onClose(); }, 1200);
  };

  return (
    <AnimatePresence>
      {flag && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 440,
              background: "var(--ink-1)",
              borderLeft: "1px solid var(--ink-3)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--ink-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--fog-0)" }}>
                  Draft message
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)", marginTop: 2 }}>
                  {flag.clientName} · {flag.severity} flag
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--ink-2)",
                  border: "1px solid var(--ink-3)",
                  color: "var(--fog-2)",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* content */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {draft && (
                <>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "var(--ink-2)",
                      borderRadius: 8,
                      border: "1px solid var(--ink-3)",
                      marginBottom: 12,
                    }}
                  >
                    <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 4 }}>
                      subject
                    </div>
                    <div style={{ fontSize: 13, color: "var(--fog-0)" }}>{draft.subject}</div>
                  </div>
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "var(--ink-2)",
                      borderRadius: 12,
                      border: "1px solid var(--ink-3)",
                      whiteSpace: "pre-wrap",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--fog-1)",
                    }}
                  >
                    {draft.body}
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "rgba(212,244,90,0.06)",
                      border: "1px solid rgba(212,244,90,0.2)",
                    }}
                  >
                    <div className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>
                      Wellness-first language. No diagnoses or treatment claims. Practitioner reviews before sending.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* actions */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--ink-3)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    background: copied ? "var(--ink-3)" : "var(--signal)",
                    color: copied ? "var(--fog-2)" : "var(--signal-ink)",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "var(--sans)",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                {draft && (
                  <a
                    href={`mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
                    style={{
                      height: 44,
                      padding: "0 16px",
                      borderRadius: 10,
                      background: "var(--ink-2)",
                      border: "1px solid var(--ink-3)",
                      color: "var(--fog-0)",
                      fontSize: 13,
                      fontFamily: "var(--sans)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Open in email
                  </a>
                )}
              </div>
              <button
                onClick={handleContacted}
                style={{
                  height: 36,
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid var(--ink-3)",
                  color: contacted ? "var(--signal)" : "var(--fog-2)",
                  fontSize: 12,
                  fontFamily: "var(--sans)",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              >
                {contacted ? "Marked as contacted" : "Mark as contacted"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
