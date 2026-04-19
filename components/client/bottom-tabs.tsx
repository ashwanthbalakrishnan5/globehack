"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/client", label: "Home", icon: "◐" },
  { href: "/client/history", label: "History", icon: "◎" },
  { href: "/client/coherence", label: "Practice", icon: "◉" },
  { href: "/client/settings", label: "Data", icon: "▤" },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(7,9,12,0.92)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        borderTop: "1px solid var(--ink-3)",
        padding: "10px 14px calc(14px + env(safe-area-inset-bottom))",
        display: "flex",
        gap: 4,
        zIndex: 20,
      }}
    >
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
              color: active ? "var(--signal)" : "var(--fog-3)",
              background: active ? "rgba(212,244,90,0.06)" : "transparent",
            }}
          >
            <span className="mono" style={{ fontSize: 14 }}>{t.icon}</span>
            <span
              className="mono upper"
              style={{ fontSize: 9, letterSpacing: 0.12, fontWeight: active ? 600 : 400 }}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
