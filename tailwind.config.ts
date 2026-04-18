import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--sans)"],
        serif: ["var(--serif)"],
        mono: ["var(--mono)"],
      },
      colors: {
        ink: {
          0: "var(--ink-0)",
          1: "var(--ink-1)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
          5: "var(--ink-5)",
        },
        bone: {
          0: "var(--bone-0)",
          1: "var(--bone-1)",
          2: "var(--bone-2)",
        },
        fog: {
          0: "var(--fog-0)",
          1: "var(--fog-1)",
          2: "var(--fog-2)",
          3: "var(--fog-3)",
        },
        signal: "var(--signal)",
        "signal-dim": "var(--signal-dim)",
        "signal-ink": "var(--signal-ink)",
        flare: "var(--flare)",
        cool: "var(--cool)",
        lymph: "var(--lymph)",
        spark: "var(--spark)",
        hrv: "var(--hrv)",
        hr: "var(--hr)",
        sleep: "var(--sleep)",
      },
    },
  },
  plugins: [],
};

export default config;
