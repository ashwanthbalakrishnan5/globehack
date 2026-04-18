"use client";

import { ReactNode } from "react";
import { BioGrid } from "@/components/primitives";

export function MScreen({
  children,
  bg = "var(--ink-0)",
  pt = 62,
}: {
  children: ReactNode;
  bg?: string;
  pt?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        background: bg,
        color: "var(--fog-0)",
        fontFamily: "var(--sans)",
        position: "relative",
        paddingTop: pt,
      }}
    >
      <BioGrid color="rgba(212,244,90,0.05)" size={22} />
      {children}
    </div>
  );
}
