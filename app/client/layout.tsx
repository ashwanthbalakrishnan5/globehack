import { ReactNode } from "react";
import { SummaryListener } from "@/components/mobile/summary-listener";

const DEMO_CLIENT_ID = process.env.DEMO_CLIENT_ID ?? "alina-zhou";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--ink-0)",
        color: "var(--fog-0)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {children}
      <SummaryListener clientId={DEMO_CLIENT_ID} />
    </div>
  );
}
