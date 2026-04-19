import type { HealthSnapshot, SessionNote, Protocol, ReasoningLine } from "./types";

export interface RecommendResult {
  protocol: Protocol;
  reasoning: ReasoningLine[];
  confidence: "high" | "medium" | "low";
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function recommend(
  snapshots: HealthSnapshot[],
  priorNotes: SessionNote[]
): RecommendResult {
  if (snapshots.length === 0) {
    return {
      protocol: {
        id: "standard-balance",
        displayName: "Standard Balance Protocol",
        duration_min: 10,
        parameters: { frequency_hz: 30, emphasis: "bilateral" },
      },
      reasoning: [{ signal: "No data", evidence: "Defaulting to standard protocol", mapsTo: "Standard balance", color: "default" }],
      confidence: "low",
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const sevenDaySlice = snapshots.slice(-7);
  const sevenDayAvgHrv = avg(sevenDaySlice.map((s) => Number(s.hrv_ms)));
  const currentHrv = Number(latest.hrv_ms);
  const baselineHrv = Number(snapshots[0].hrv_ms);

  const hrv7dPct = sevenDayAvgHrv > 0 ? ((currentHrv - sevenDayAvgHrv) / sevenDayAvgHrv) * 100 : 0;
  const hrv14dPct = baselineHrv > 0 ? ((currentHrv - baselineHrv) / baselineHrv) * 100 : 0;

  const rhrBaseline = Number(snapshots[0].resting_hr_bpm);
  const rhrCurrent = latest.resting_hr_bpm;
  const rhrDelta = rhrCurrent - rhrBaseline;

  const sleepRecent5 = snapshots.slice(-5).map((s) => s.sleep_score);
  const lowSleepNights = sleepRecent5.filter((s) => s < 70).length;

  const hasAsymmetryNote = priorNotes.some(
    (n) => n.note_type === "complaint" && /(trap|shoulder|asymmetr|left|right)/i.test(n.text)
  );

  const reasoning: ReasoningLine[] = [];
  let durationMin = 10;
  let frequencyHz = 30;
  let emphasis = "bilateral";
  let placement: string | undefined;
  let conditions = 0;

  if (currentHrv < 40 || hrv7dPct < -10) {
    reasoning.push({
      signal: `HRV ${Math.round(currentHrv)}ms`,
      evidence: `down ${Math.abs(Math.round(hrv7dPct))}% vs 7-day avg`,
      mapsTo: "Cooling emphasis + 40Hz lymphatic vibration",
      color: "hrv",
    });
    frequencyHz = 40;
    emphasis = "cooling";
    conditions++;
  } else if (hrv14dPct < -8) {
    reasoning.push({
      signal: `HRV ${Math.round(currentHrv)}ms`,
      evidence: `down ${Math.abs(Math.round(hrv14dPct))}% over 14 days`,
      mapsTo: "Cooling emphasis",
      color: "hrv",
    });
    frequencyHz = 40;
    emphasis = "cooling";
    conditions++;
  }

  if (rhrDelta > 8) {
    reasoning.push({
      signal: `Resting HR ${rhrCurrent}bpm`,
      evidence: `elevated ${rhrDelta}bpm vs baseline`,
      mapsTo: "Extended duration 12 min + parasympathetic sequence",
      color: "hr",
    });
    durationMin = 12;
    conditions++;
  }

  if (lowSleepNights >= 3) {
    reasoning.push({
      signal: `Sleep score ${latest.sleep_score}`,
      evidence: `below 70 for ${lowSleepNights} of last 5 nights`,
      mapsTo: "Warmth coda + low-frequency vibration",
      color: "sleep",
    });
    conditions++;
  }

  if (hasAsymmetryNote) {
    const note = priorNotes.find((n) => n.note_type === "complaint" && /(trap|shoulder|asymmetr|left|right)/i.test(n.text));
    const isLeft = /(left|L trap)/i.test(note?.text ?? "");
    placement = isLeft ? "Sun pad left" : "Sun pad right";
    reasoning.push({
      signal: "Prior note",
      evidence: `"${note?.quote ?? "asymmetry flagged"}"`,
      mapsTo: `${placement} placement`,
      color: "note",
    });
    conditions++;
  }

  if (conditions === 0) {
    return {
      protocol: {
        id: "standard-balance",
        displayName: "Standard Balance Protocol",
        duration_min: 10,
        parameters: { frequency_hz: 30, emphasis: "bilateral" },
      },
      reasoning: [{ signal: "All baselines", evidence: "HRV, RHR, sleep within normal ranges", mapsTo: "Standard protocol", color: "default" }],
      confidence: "medium",
    };
  }

  let protocolName = "Cooling Emphasis with 40 Hz Lymphatic Vibration";
  if (emphasis !== "cooling") {
    if (lowSleepNights >= 3) {
      protocolName = "Warmth Emphasis with Low-Frequency Vibration";
    } else if (hasAsymmetryNote) {
      protocolName = "Sun Pad Asymmetric Protocol";
    }
  }
  if (hasAsymmetryNote && emphasis === "cooling") {
    protocolName = "Cooling Emphasis with 40 Hz Lymphatic Vibration";
  }

  return {
    protocol: {
      id: protocolName.toLowerCase().replace(/\s+/g, "-"),
      displayName: protocolName,
      duration_min: durationMin,
      parameters: {
        frequency_hz: frequencyHz,
        emphasis,
        ...(placement ? { placement } : {}),
      },
    },
    reasoning,
    confidence: conditions >= 3 ? "high" : conditions === 2 ? "medium" : "low",
  };
}
