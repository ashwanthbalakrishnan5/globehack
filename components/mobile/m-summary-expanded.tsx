"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MScreen } from "./shell";
import { Meter } from "@/components/primitives";
import type { SummaryCard } from "@/lib/types";

const BodyViewer = dynamic(() => import("@/components/features/body-viewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 60%, rgba(212,244,90,0.08), #0a0d14 70%)",
      }}
    />
  ),
});

interface Props {
  card?: SummaryCard | null;
  summaryId?: string | null;
}

export function MSummaryExpanded({ card, summaryId }: Props) {
  const quote = card?.quote ?? "Left trap is worse this week.";
  const durationMin = card?.duration_min ?? 42;
  const hrvAtSession = card?.hrv_at_session ?? 50;
  const bodyBefore = card?.body_before ?? {};
  const bodyAfter = card?.body_after ?? {};
  const hasBody = Object.keys(bodyBefore).length > 0 || Object.keys(bodyAfter).length > 0;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [sharing, startShare] = useTransition();
  const [liked, setLiked] = useState(false);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    if (!hasBody) return;
    const t = setInterval(() => setShowAfter((v) => !v), 2200);
    return () => clearInterval(t);
  }, [hasBody]);

  const handleShare = () => {
    startShare(async () => {
      if (!cardRef.current) return;
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: "#0b0e11",
          scale: 3,
          useCORS: true,
          logging: false,
        });
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png", 1)
        );
        if (!blob) return;
        const file = new File([blob], "tide-session.png", { type: "image/png" });
        const shareUrl = summaryId
          ? `${window.location.origin}/share/${summaryId}`
          : window.location.origin;
        if (
          typeof navigator !== "undefined" &&
          "share" in navigator &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: "Tide · session summary",
            text: quote,
            url: shareUrl,
          });
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tide-session.png";
        a.click();
        URL.revokeObjectURL(url);
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } catch (e) {
        console.error("share failed", e);
      }
    });
  };

  return (
    <MScreen pt={54}>
      <div
        ref={cardRef}
        style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/client"
            aria-label="Close summary"
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
            ×
          </Link>
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)" }}>
            Session · Today
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ↗
          </div>
        </div>
        <div style={{ marginTop: 36, textAlign: "center", padding: "0 8px" }}>
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginBottom: 16 }}>
            ── you said ──
          </div>
          <div
            className="serif"
            style={{
              fontSize: 32,
              lineHeight: 1.2,
              color: "var(--fog-0)",
              fontStyle: "italic",
              letterSpacing: -0.01,
            }}
          >
            &ldquo;{quote.length > 60 ? quote.slice(0, 60) + "…" : quote}&rdquo;
          </div>
        </div>
        {hasBody ? (
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(["before", "after"] as const).map((kind) => (
              <div
                key={kind}
                style={{
                  height: 180,
                  borderRadius: 14,
                  border: "1px solid var(--ink-3)",
                  background: "var(--ink-1)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <BodyViewer
                  markedParts={kind === "before" ? bodyBefore : bodyAfter}
                  background="#0a0d14"
                />
                <AnimatePresence>
                  {((kind === "before" && !showAfter) || (kind === "after" && showAfter)) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "rgba(212,244,90,0.16)",
                        color: "var(--signal)",
                        fontSize: 9,
                        letterSpacing: 0.12,
                        textTransform: "uppercase",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {kind}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20, marginBottom: 8 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,244,90,0.4), transparent)",
                filter: "blur(8px)",
              }}
            />
          </div>
        )}
        <div
          style={{
            marginTop: 14,
            padding: 18,
            borderRadius: 18,
            background: "var(--ink-2)",
            border: "1px solid var(--ink-3)",
          }}
        >
          <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)" }}>── measured ──</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="mono tnum" style={{ fontSize: 26, color: "var(--fog-0)", fontWeight: 300 }}>
                <span style={{ color: "var(--signal)" }}>↓</span>11
                <span style={{ fontSize: 13, color: "var(--fog-3)" }}>&nbsp;bpm</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 2 }}>Heart rate, in {durationMin} min</div>
              <Meter pct={82} color="var(--signal)" delay={0.2} />
            </div>
            <div>
              <div className="mono tnum" style={{ fontSize: 26, color: "var(--fog-0)", fontWeight: 300 }}>
                <span style={{ color: "var(--signal)" }}>+</span>18
                <span style={{ fontSize: 13, color: "var(--fog-3)" }}>&nbsp;ms</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 2 }}>HRV shift</div>
              <Meter pct={65} color="var(--signal)" delay={0.4} />
            </div>
            <div>
              <div className="mono tnum" style={{ fontSize: 26, color: "var(--fog-0)", fontWeight: 300 }}>
                40<span style={{ fontSize: 13, color: "var(--fog-3)" }}>&nbsp;hz</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 2 }}>Lymphatic vibration</div>
              <Meter pct={100} color="var(--lymph)" delay={0.6} />
            </div>
            <div>
              <div className="mono tnum" style={{ fontSize: 26, color: "var(--fog-0)", fontWeight: 300 }}>
                {hrvAtSession}<span style={{ fontSize: 13, color: "var(--fog-3)" }}>&nbsp;ms</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--fog-2)", marginTop: 2 }}>HRV at session</div>
              <Meter pct={Math.round((hrvAtSession / 100) * 100)} color="var(--cool)" delay={0.8} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingBottom: 32, display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              boxShadow: "var(--glow-signal)",
              cursor: sharing ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: sharing ? 0.85 : 1,
            }}
          >
            {sharing && <Loader2 size={16} className="animate-spin" />}
            {sharing ? "Rendering card..." : "Share card"}
          </button>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-pressed={liked}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: liked ? "rgba(212,244,90,0.12)" : "var(--ink-2)",
              border: `1px solid ${liked ? "var(--signal)" : "var(--ink-3)"}`,
              color: liked ? "var(--signal)" : "var(--fog-0)",
              fontSize: 18,
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={liked ? "on" : "off"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 18 }}
                style={{ display: "inline-block" }}
              >
                {liked ? "♥" : "♡"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </MScreen>
  );
}
