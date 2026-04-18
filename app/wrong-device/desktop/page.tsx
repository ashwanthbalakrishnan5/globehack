import Link from "next/link";
import { TideMark } from "@/components/primitives";

export default function DesktopNeeded() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <TideMark size={28} />
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-3)", letterSpacing: 0.12 }}>
            Tide · practitioner
          </span>
        </div>
        <div className="display-lg" style={{ maxWidth: 460 }}>
          Open this on your <em>desk</em>.
        </div>
        <div style={{ color: "var(--fog-2)", fontSize: 14, lineHeight: 1.55 }}>
          The practitioner dashboard runs on a tablet or laptop. It&rsquo;s designed for the
          treatment room, not a phone. Switch devices and sign back in.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <Link
            href="/"
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              color: "var(--fog-0)",
              fontSize: 13,
              fontFamily: "var(--sans)",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            back to tide.app
          </Link>
          <Link
            href="/practitioner?override=1"
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Continue anyway · demo mode
          </Link>
        </div>
      </div>
    </div>
  );
}
