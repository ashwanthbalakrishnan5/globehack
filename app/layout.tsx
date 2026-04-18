import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--sans",
  weight: ["300", "400", "500", "600", "700"],
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--serif",
  weight: "400",
  style: ["normal", "italic"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--mono",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Tide — companion layer for Hydrawav3",
  description:
    "Tide · the client nervous system for Hydrawav3 practitioners. Wearable signal, live session context, and lockscreen summary cards, shared through one session-scoped, revocable window.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
