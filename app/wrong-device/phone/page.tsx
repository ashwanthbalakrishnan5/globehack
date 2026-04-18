import Link from "next/link";
import { TideMark } from "@/components/primitives";

export default function PhoneNeeded() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <TideMark size={28} />
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-3)", letterSpacing: 0.12 }}>
            Tide · client
          </span>
        </div>
        <div className="display-xl" style={{ maxWidth: 460 }}>
          Open this on your <em>phone</em>.
        </div>
        <div style={{ color: "var(--fog-2)", fontSize: 15, lineHeight: 1.55 }}>
          The client companion is mobile-only. Everything lives on your phone, session-scoped, revocable.
          The practitioner side runs on a tablet or desktop.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Link
            href="/?role=client"
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              color: "var(--fog-0)",
              fontSize: 13,
              fontFamily: "var(--sans)",
              textDecoration: "none",
            }}
          >
            ← back to tide.app
          </Link>
          <Link
            href="/client?override=1"
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              textDecoration: "none",
            }}
          >
            Continue anyway · demo mode
          </Link>
        </div>
      </div>
    </div>
  );
}
