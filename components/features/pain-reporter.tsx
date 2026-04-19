"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { BodyViewerHandle, MarkedParts, BodyPartStatus } from "./body-viewer";
import { BODY_PARTS } from "./body-viewer";

const BodyViewer = dynamic(() => import("./body-viewer"), { ssr: false });

const GROUPS = [
  { label: "Upper Body", ids: ["head", "neck", "left_shoulder", "right_shoulder", "chest", "left_arm", "right_arm"] },
  { label: "Core",       ids: ["abdomen", "lower_back"] },
  { label: "Lower Body", ids: ["left_hip", "right_hip", "left_thigh", "right_thigh", "left_knee", "right_knee", "left_leg", "right_leg", "feet"] },
];

type Mode = "pain" | "recovered";

interface PainReporterProps {
  onChange?: (parts: MarkedParts) => void;
}

export function PainReporter({ onChange }: PainReporterProps) {
  const [mode, setMode] = useState<Mode>("pain");
  const [markedParts, setMarkedParts] = useState<MarkedParts>({});
  const viewerRef = useRef<BodyViewerHandle>(null);

  const togglePart = useCallback((id: string) => {
    setMarkedParts((prev) => {
      const next = { ...prev };
      if (next[id] === (mode as BodyPartStatus)) {
        delete next[id];
      } else {
        next[id] = mode as BodyPartStatus;
      }
      onChange?.(next);
      return next;
    });
  }, [mode, onChange]);

  const handleHover = useCallback((id: string | null) => {
    viewerRef.current?.hoverPart(id);
  }, []);

  const clearAll = useCallback(() => {
    setMarkedParts({});
    onChange?.({});
  }, [onChange]);

  return (
    <div className="flex h-full bg-[#0a0d14]">
      <div className="relative flex-1">
        <BodyViewer ref={viewerRef} markedParts={markedParts} />

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7a9cc4] inline-block" /> Normal
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Pain
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Recovered
          </span>
        </div>

        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-700 pointer-events-none">
          Drag to rotate · Scroll to zoom
        </p>
      </div>

      <aside className="w-72 flex flex-col bg-[#0d1120] border-l border-white/5 overflow-hidden select-none">
        <div className="px-5 pt-5 pb-4 border-b border-white/5">
          <h1 className="text-sm font-bold tracking-widest uppercase text-slate-300 mb-1">Body Map</h1>
          <p className="text-[11px] text-slate-600">Select a body part to mark it</p>
        </div>

        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <button
              onClick={() => setMode("pain")}
              className={`flex-1 py-2 text-xs font-semibold transition-all ${
                mode === "pain"
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Pain
            </button>
            <button
              onClick={() => setMode("recovered")}
              className={`flex-1 py-2 text-xs font-semibold transition-all ${
                mode === "recovered"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Recovered
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-1 mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.ids.map((id) => {
                  const part = BODY_PARTS.find((p) => p.id === id)!;
                  const state = markedParts[id];
                  return (
                    <button
                      key={id}
                      onClick={() => togglePart(id)}
                      onMouseEnter={() => handleHover(id)}
                      onMouseLeave={() => handleHover(null)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 border ${
                        state === "pain"
                          ? "bg-red-950/60 border-red-700/50 text-red-300 shadow-sm shadow-red-900/30"
                          : state === "recovered"
                          ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-300 shadow-sm shadow-emerald-900/30"
                          : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 hover:border-white/10"
                      }`}
                    >
                      <span className="text-base leading-none">{part.icon}</span>
                      <span className="flex-1 text-xs font-medium">{part.label}</span>
                      {state && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            state === "pain"
                              ? "bg-red-700/40 text-red-300"
                              : "bg-emerald-700/40 text-emerald-300"
                          }`}
                        >
                          {state}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={clearAll}
            disabled={Object.keys(markedParts).length === 0}
            className="w-full py-2 rounded-xl text-slate-600 text-xs hover:text-slate-400 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
        </div>
      </aside>
    </div>
  );
}
