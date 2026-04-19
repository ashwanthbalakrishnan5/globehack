"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { TideMark } from "@/components/primitives";

export type SidebarKey =
  | "today"
  | "clients"
  | "live"
  | "notes"
  | "revenue"
  | "relapse";

const NAV: {
  k: SidebarKey;
  label: string;
  icon: string;
  href: string;
  matches: (p: string) => boolean;
  badge?: string;
}[] = [
  {
    k: "today",
    label: "Today",
    icon: "◐",
    href: "/practitioner",
    matches: (p) => p === "/practitioner",
  },
  {
    k: "live",
    label: "Live",
    icon: "◉",
    href: "/practitioner/session/marcus-rivera/device",
    matches: (p) => /\/session\/[^/]+\/(live|resonance)/.test(p) || p.endsWith("/session/marcus-rivera"),
  },
  {
    k: "notes",
    label: "Notes",
    icon: "▤",
    href: "/practitioner/session/marcus-rivera/notes",
    matches: (p) => p.includes("/notes"),
  },
  {
    k: "clients",
    label: "Clients",
    icon: "◎",
    href: "/practitioner/clients/marcus-rivera",
    matches: (p) => p.startsWith("/practitioner/clients"),
  },
  {
    k: "revenue",
    label: "Revenue",
    icon: "⌁",
    href: "/practitioner/revenue",
    matches: (p) => p === "/practitioner/revenue",
  },
  {
    k: "relapse",
    label: "Relapse",
    icon: "⚠",
    href: "/practitioner/relapse",
    matches: (p) => p === "/practitioner/relapse",
    badge: "1",
  },
];

export function WSidebar({ active }: { active?: SidebarKey }) {
  const pathname = usePathname() || "";
  const derived = NAV.find((n) => n.matches(pathname))?.k;
  const current = active ?? derived ?? "today";
  return (
    <div
      style={{
        width: 210,
        background: "var(--ink-1)",
        borderRight: "1px solid var(--ink-3)",
        display: "flex",
        flexDirection: "column",
        padding: "18px 14px",
        flexShrink: 0,
      }}
    >
      <Link
        href="/practitioner"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 8px 20px",
          color: "var(--fog-0)",
          textDecoration: "none",
        }}
      >
        <TideMark size={22} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.3 }}>Tide</div>
          <div className="mono upper" style={{ fontSize: 8, color: "var(--fog-3)" }}>
            practitioner
          </div>
        </div>
      </Link>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((it) => (
          <Link
            key={it.k}
            href={it.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 8,
              cursor: "pointer",
              background: current === it.k ? "var(--ink-3)" : "transparent",
              color: current === it.k ? "var(--fog-0)" : "var(--fog-2)",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 12,
                color: current === it.k ? "var(--signal)" : "var(--fog-3)",
                width: 14,
              }}
            >
              {it.icon}
            </span>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && (
              <span
                className="mono"
                style={{
                  background: "var(--flare)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: 999,
                }}
              >
                {it.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: 10,
          borderRadius: 10,
          background: "var(--ink-2)",
          border: "1px solid var(--ink-3)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background:
              "repeating-linear-gradient(-20deg, var(--ink-3), var(--ink-3) 3px, var(--ink-4) 3px, var(--ink-4) 4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "var(--fog-2)",
          }}
        >
          MR
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--fog-0)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Maya Reyes
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--fog-3)" }}>
            Stillwater · DPT
          </div>
        </div>
      </div>
    </div>
  );
}

export function WShell({
  children,
  pageName,
}: {
  children: ReactNode;
  pageName?: SidebarKey;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        fontFamily: "var(--sans)",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WSidebar active={pageName} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function WHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "20px 28px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--ink-3)",
        flexShrink: 0,
      }}
    >
      <div>
        {sub && (
          <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", marginBottom: 6 }}>
            {sub}
          </div>
        )}
        <div className="serif" style={{ fontSize: 32, letterSpacing: -0.02, lineHeight: 1 }}>
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}

export function StatBlock({
  value,
  label,
  trend,
  color = "var(--fog-0)",
}: {
  value: string;
  label: string;
  trend?: string;
  color?: string;
}) {
  return (
    <div>
      <div className="mono tnum" style={{ fontSize: 26, color, fontWeight: 300, lineHeight: 1 }}>
        {value}
      </div>
      <div className="mono upper" style={{ fontSize: 9, color: "var(--fog-3)", marginTop: 4 }}>
        {label}
      </div>
      {trend && (
        <div className="mono" style={{ fontSize: 9, color: "var(--signal)", marginTop: 2 }}>
          {trend}
        </div>
      )}
    </div>
  );
}
