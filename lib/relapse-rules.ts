import type { HealthSnapshot, SessionNote, Severity } from "./types";

export interface RelapseFlagResult {
  severity: Severity | null;
  reason: string;
  signals: string[];
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function computeRelapseFlag(
  snapshots: HealthSnapshot[],
  priorNotes: SessionNote[],
  daysSinceLastVisit: number
): RelapseFlagResult {
  if (snapshots.length < 7) {
    return { severity: null, reason: "", signals: [] };
  }

  const hrvValues = snapshots.map((s) => Number(s.hrv_ms));

  let consecutiveDown = 0;
  let maxConsecutive = 0;
  for (let i = 1; i < hrvValues.length; i++) {
    if (hrvValues[i] < hrvValues[i - 1]) {
      consecutiveDown++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDown);
    } else {
      consecutiveDown = 0;
    }
  }
  const firstHrv = hrvValues[0];
  const lastHrv = hrvValues[hrvValues.length - 1];
  const hrvDropPct = firstHrv > 0 ? Math.round(((firstHrv - lastHrv) / firstHrv) * 100) : 0;

  const condA = maxConsecutive >= 7;
  const condB = priorNotes.filter((n) => n.note_type === "complaint" && n.flagged).length >= 2;
  const condC = daysSinceLastVisit > 14;

  const signals: string[] = [];
  if (condA) signals.push(`HRV trending down ${maxConsecutive} consecutive days (↓${hrvDropPct}%)`);
  if (condB) {
    const flaggedNotes = priorNotes.filter((n) => n.note_type === "complaint" && n.flagged);
    signals.push(`Pain flagged: "${flaggedNotes[0]?.quote ?? "complaint"}"`);
    if (flaggedNotes[1]) signals.push(`Pain flagged: "${flaggedNotes[1]?.quote ?? "complaint"}"`);
  }
  if (condC) signals.push(`${daysSinceLastVisit} days since last appointment (threshold: 14)`);

  const condCount = [condA, condB, condC].filter(Boolean).length;

  if (condCount === 0) return { severity: null, reason: "", signals: [] };

  const severity: Severity = condCount >= 3 ? "high" : condCount === 2 ? "medium" : "low";
  const parts: string[] = [];
  if (condA) parts.push(`HRV down ${hrvDropPct}% over ${maxConsecutive} days`);
  if (condB) parts.push("pain flagged in last 2 sessions");
  if (condC) parts.push(`${daysSinceLastVisit} days since last visit`);

  return {
    severity,
    reason: parts.join(", "),
    signals,
  };
}
