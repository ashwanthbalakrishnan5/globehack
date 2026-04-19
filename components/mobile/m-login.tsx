"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { MScreen } from "./shell";
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
        width: "100%",
        height: 50,
        borderRadius: 12,
        background: provider === "apple" ? "var(--fog-0)" : "var(--ink-2)",
        color: provider === "apple" ? "var(--ink-0)" : "var(--fog-0)",
        border: provider === "apple" ? "none" : "1px solid var(--ink-3)",
        fontSize: 14,
        fontFamily: "var(--sans)",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 16 }}>{provider === "google" ? "G" : ""}</span>
      <span>{label}</span>
    </button>
  );
}

export function MClientLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const enter = () => {
    setPending(true);
    setAuthCookie();
    setTimeout(() => router.push("/client/onboarding"), 250);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    enter();
  };

  return (
    <MScreen pt={32}>
      <div
        style={{
          padding: "28px 24px 40px",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 32px)",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TideMark size={22} />
          <span className="mono upper" style={{ fontSize: 11, color: "var(--fog-2)" }}>
            Tide · for Hydrawav3
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginTop: 12 }}
        >
          <div
            className="mono upper"
            style={{ fontSize: 10, color: "var(--signal)", letterSpacing: 0.14, marginBottom: 10 }}
          >
            welcome back
          </div>
          <div className="display-xl" style={{ color: "var(--fog-0)", fontSize: 44 }}>
            Your <em>nervous system</em>, one window.
          </div>
          <div style={{ fontSize: 14, color: "var(--fog-2)", marginTop: 12, lineHeight: 1.5 }}>
            Fourteen days of signal, shared with your practitioner on your terms.
          </div>
        </motion.div>

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              className="mono upper"
              style={{ fontSize: 10, color: "var(--fog-3)", letterSpacing: 0.14 }}
            >
              email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                height: 50,
                padding: "0 14px",
                borderRadius: 12,
                background: "var(--ink-2)",
                border: "1px solid var(--ink-3)",
                color: "var(--fog-0)",
                fontSize: 15,
                fontFamily: "var(--sans)",
                outline: "none",
              }}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            style={{
              height: 54,
              marginTop: 6,
              borderRadius: 14,
              background: "var(--signal)",
              color: "var(--signal-ink)",
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              boxShadow: "var(--glow-signal)",
              cursor: "pointer",
              opacity: pending ? 0.8 : 1,
            }}
          >
            {pending ? "Entering…" : "Enter Tide"}
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
          <SocialButton provider="google" onClick={enter} />
          <SocialButton provider="apple" onClick={enter} />
        </form>

        <div
          className="mono upper"
          style={{
            fontSize: 9,
            color: "var(--fog-3)",
            textAlign: "center",
            letterSpacing: 0.12,
            marginTop: 8,
          }}
        >
          session-scoped · revocable · never central storage
        </div>
      </div>
    </MScreen>
  );
}
