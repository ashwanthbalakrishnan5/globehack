"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { TideMark } from "@/components/primitives";

function setAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "tide-auth=1; path=/; max-age=2592000; samesite=lax";
}

function SocialButton({ provider, onClick }: { provider: "google" | "apple"; onClick: () => void }) {
  const label = provider === "google" ? "Continue with Google" : "Continue with Apple";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 48,
        borderRadius: 10,
        background: provider === "apple" ? "var(--fog-0)" : "var(--ink-2)",
        color: provider === "apple" ? "var(--ink-0)" : "var(--fog-0)",
        border: provider === "apple" ? "none" : "1px solid var(--ink-3)",
        fontSize: 13,
        fontFamily: "var(--sans)",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 14 }}>{provider === "google" ? "G" : ""}</span>
      <span>{label}</span>
    </button>
  );
}

export function WPractitionerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const enter = () => {
    setPending(true);
    setAuthCookie();
    setTimeout(() => router.push("/practitioner"), 250);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    enter();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(212,244,90,0.09), transparent 60%), radial-gradient(ellipse 50% 50% at 85% 80%, rgba(111,184,255,0.05), transparent 70%)",
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

      <div
        style={{
          position: "relative",
          flex: "1 1 0",
          padding: "40px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <TideMark size={22} />
          <span style={{ fontFamily: "var(--serif)", fontSize: 22, letterSpacing: -0.5 }}>
            Tide
          </span>
          <span
            className="mono upper"
            style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.12, marginLeft: 10 }}
          >
            for Hydrawav3
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 520 }}
        >
          <div
            className="mono upper"
            style={{ fontSize: 11, color: "var(--signal)", letterSpacing: 0.14, marginBottom: 18 }}
          >
            practitioner sign-in
          </div>
          <h1
            className="display-xl"
            style={{ fontSize: 56, lineHeight: 1.04, color: "var(--fog-0)" }}
          >
            Open the room. <em>Greet every client on signal.</em>
          </h1>
          <p
            style={{
              marginTop: 18,
              color: "var(--fog-2)",
              fontSize: 16,
              lineHeight: 1.55,
              maxWidth: 460,
            }}
          >
            Your day, your clients, their quoted words. One session-scoped window, revocable after
            every visit.
          </p>
        </motion.div>

        <div className="mono upper" style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.12 }}>
          session-scoped · revocable · never central storage
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: 460,
          flexShrink: 0,
          padding: 40,
          borderLeft: "1px solid var(--ink-3)",
          background: "linear-gradient(180deg, var(--ink-1), var(--ink-0))",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          className="mono upper"
          style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.14, marginBottom: 10 }}
        >
          sign in
        </div>
        <div
          className="display-md"
          style={{ color: "var(--fog-0)", fontSize: 26, marginBottom: 24 }}
        >
          Welcome back.
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              className="mono upper"
              style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.14 }}
            >
              work email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maya@stillwater.co"
              autoComplete="email"
              style={{
                height: 46,
                padding: "0 14px",
                borderRadius: 10,
                background: "var(--ink-2)",
                border: "1px solid var(--ink-3)",
                color: "var(--fog-0)",
                fontSize: 14,
                fontFamily: "var(--sans)",
                outline: "none",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              className="mono upper"
              style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.14 }}
            >
              password
            </span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                height: 46,
                padding: "0 14px",
                borderRadius: 10,
                background: "var(--ink-2)",
                border: "1px solid var(--ink-3)",
                color: "var(--fog-0)",
                fontSize: 14,
                fontFamily: "var(--sans)",
                outline: "none",
              }}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            style={{
              height: 50,
              marginTop: 6,
              borderRadius: 12,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              boxShadow: "var(--glow-signal)",
              cursor: "pointer",
              opacity: pending ? 0.8 : 1,
            }}
          >
            {pending ? "Opening room…" : "Enter Tide"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "8px 0",
              color: "var(--fog-3)",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--ink-3)" }} />
            <span className="mono upper" style={{ fontSize: 9, letterSpacing: 0.18 }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--ink-3)" }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <SocialButton provider="google" onClick={enter} />
            <SocialButton provider="apple" onClick={enter} />
          </div>
        </form>

        <div
          className="mono upper"
          style={{
            fontSize: 9,
            color: "var(--fog-3)",
            letterSpacing: 0.12,
            marginTop: 28,
            textAlign: "center",
          }}
        >
          by signing in you agree to Tide&rsquo;s wellness terms
        </div>
      </div>
    </div>
  );
}
