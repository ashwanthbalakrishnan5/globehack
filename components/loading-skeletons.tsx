"use client";

import { motion } from "framer-motion";

const shimmer = {
  background:
    "linear-gradient(90deg, var(--ink-2) 0%, var(--ink-3) 40%, var(--ink-2) 80%)",
  backgroundSize: "200% 100%",
};

const shimmerAnim = {
  animate: { backgroundPosition: ["200% 0%", "-200% 0%"] },
  transition: { duration: 1.8, repeat: Infinity, ease: "linear" as const },
};

function Block({
  w,
  h,
  radius = 10,
  mt = 0,
}: {
  w: string | number;
  h: number;
  radius?: number;
  mt?: number;
}) {
  return (
    <motion.div
      {...shimmerAnim}
      style={{
        ...shimmer,
        width: w,
        height: h,
        borderRadius: radius,
        marginTop: mt,
      }}
    />
  );
}

export function PractitionerSessionSkeleton() {
  return (
    <div
      style={{
        height: "100vh",
        background: "var(--ink-0)",
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        padding: "48px 20px 20px 20px",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Block w="100%" h={88} radius={16} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Block w="100%" h={74} />
          <Block w="100%" h={74} />
          <Block w="100%" h={74} />
        </div>
        <Block w="100%" h={120} radius={14} />
        <Block w="100%" h={60} />
        <Block w="100%" h={60} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Block w={320} h={20} radius={6} />
        <Block w="60%" h={40} radius={8} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Block w="100%" h={94} />
          <Block w="100%" h={94} />
          <Block w="100%" h={94} />
          <Block w="100%" h={94} />
        </div>
        <Block w="100%" h={180} radius={16} />
      </div>
    </div>
  );
}

export function ClientSummarySkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 20%, rgba(212,244,90,0.12), var(--ink-0) 70%)",
        padding: "64px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Block w={140} h={12} radius={4} />
      <Block w="85%" h={40} radius={8} mt={18} />
      <Block w="60%" h={40} radius={8} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
        <Block w="100%" h={180} radius={14} />
        <Block w="100%" h={180} radius={14} />
      </div>
      <Block w="100%" h={140} radius={18} mt={14} />
      <div style={{ flex: 1 }} />
      <Block w="100%" h={52} radius={14} />
    </div>
  );
}

export function ClientSessionSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink-0)",
        padding: "64px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Block w={120} h={28} radius={6} />
        <Block w={140} h={28} radius={6} />
      </div>
      <Block w="100%" h={300} radius={20} mt={4} />
      <Block w="100%" h={64} radius={16} />
      <div style={{ flex: 1 }} />
      <Block w="100%" h={52} radius={14} />
    </div>
  );
}
