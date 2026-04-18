import Link from "next/link";
import { TideMark } from "@/components/primitives";

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(212,244,90,0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(111,184,255,0.05), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(212,244,90,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          padding: "28px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TideMark size={22} />
          <span style={{ fontFamily: "var(--serif)", fontSize: 24, letterSpacing: -0.5 }}>Tide</span>
          <span
            className="mono upper"
            style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.12, marginLeft: 10 }}
          >
            for Hydrawav3 · v0.1
          </span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Link
            href="/design-system"
            className="mono upper"
            style={{
              fontSize: 10,
              color: "var(--fog-3)",
              textDecoration: "none",
              letterSpacing: 0.12,
            }}
          >
            design system
          </Link>
        </div>
      </header>

      <main
        style={{
          position: "relative",
          padding: "40px 40px 80px",
          display: "grid",
          gap: 60,
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          alignItems: "center",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        <section>
          <div
            className="mono upper"
            style={{
              fontSize: 11,
              color: "var(--signal)",
              letterSpacing: 0.14,
              marginBottom: 24,
            }}
          >
            companion layer · globehack 2026
          </div>
          <h1
            className="display-xl"
            style={{
              fontSize: 64,
              lineHeight: 1.02,
              color: "var(--fog-0)",
              maxWidth: 680,
              marginBottom: 20,
            }}
          >
            Hydrawav3 built the practitioner&rsquo;s AI brain.{" "}
            <em>Tide is the client&rsquo;s nervous system.</em>
          </h1>
          <p
            style={{
              color: "var(--fog-2)",
              fontSize: 17,
              lineHeight: 1.55,
              maxWidth: 560,
              marginBottom: 36,
            }}
          >
            Wearable signal from the phone, live context on the tablet, the client&rsquo;s own quoted
            words on the lockscreen after the session. One session-scoped, revocable window between
            the two of you.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/client"
              style={{
                padding: "16px 26px",
                borderRadius: 12,
                background: "var(--signal)",
                color: "var(--signal-ink)",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "var(--sans)",
                textDecoration: "none",
                boxShadow: "var(--glow-signal)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>Open the client app</span>
              <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>· mobile</span>
            </Link>
            <Link
              href="/practitioner"
              style={{
                padding: "16px 26px",
                borderRadius: 12,
                background: "transparent",
                color: "var(--fog-0)",
                border: "1px solid var(--ink-4)",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "var(--sans)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>Open the practitioner dashboard</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--fog-3)" }}>· tablet</span>
            </Link>
          </div>

          <div
            className="mono upper"
            style={{
              fontSize: 10,
              color: "var(--fog-3)",
              letterSpacing: 0.12,
              marginTop: 32,
            }}
          >
            open the client on your phone · the dashboard on your laptop · same account
          </div>
        </section>

        <aside
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {[
            {
              k: "before",
              v: "fourteen days of wearable signal, shared in one tap",
            },
            {
              k: "during",
              v: "ambient transcript diarised on-device, notes auto-extracted",
            },
            {
              k: "after",
              v: "the client&rsquo;s own words back on their lockscreen in under ten seconds",
            },
          ].map((b, i) => (
            <div
              key={b.k}
              style={{
                padding: 18,
                borderRadius: 14,
                background: "var(--ink-2)",
                border: "1px solid var(--ink-3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background:
                    i === 1 ? "var(--signal)" : "rgba(212,244,90,0.35)",
                }}
              />
              <div
                className="mono upper"
                style={{
                  fontSize: 10,
                  color: "var(--signal)",
                  letterSpacing: 0.18,
                  marginBottom: 8,
                }}
              >
                {b.k}
              </div>
              <div
                style={{ fontSize: 15, color: "var(--fog-0)", lineHeight: 1.4 }}
                dangerouslySetInnerHTML={{ __html: b.v }}
              />
            </div>
          ))}
          <div
            className="mono"
            style={{
              marginTop: 6,
              fontSize: 11,
              color: "var(--fog-3)",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px dashed var(--ink-4)",
            }}
          >
            session-scoped · revocable · never central storage
          </div>
        </aside>
      </main>
    </div>
  );
}
