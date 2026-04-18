/* Demo-grade mock data. Would be backed by Insforge in production. */

export type Severity = "low" | "medium" | "high";

export type Client = {
  id: string;
  name: string;
  initials: string;
  age: number;
  profile: string;
  pairedOn: string;
  sessionCount: number;
  nextBookedOn: string | null;
  latest: {
    hrvMs: number;
    hrvTrendPct: number;
    restingHrBpm: number;
    restingHrDelta: number;
    sleepLabel: string;
    sleepPct: number;
  };
  hrvTrend14: number[];
  priorNotes: { date: string; quote: string }[];
  recurringThemes: { t: string; n: number }[];
};

export type Slot = {
  time: string;
  clientId: string;
  tag: string;
  readiness: number;
  protocol: string;
  state: "done" | "now" | "soon";
};

export type Flag = {
  clientId: string;
  severity: Severity;
  reason: string;
  signals: string[];
  lastVisit: string;
  hrvTrend: number[];
};

export const PRACTITIONER = {
  id: "maya-reyes",
  name: "Maya Reyes",
  initials: "MR",
  title: "DPT",
  clinic: "Stillwater Recovery",
  city: "Austin",
};

export const CLIENTS: Client[] = [
  {
    id: "jordan-kim",
    name: "Jordan Kim",
    initials: "JK",
    age: 34,
    profile: "endurance athlete",
    pairedOn: "6 weeks ago",
    sessionCount: 7,
    nextBookedOn: "Apr 24",
    latest: {
      hrvMs: 54,
      hrvTrendPct: -18,
      restingHrBpm: 64,
      restingHrDelta: 6,
      sleepLabel: "5:42",
      sleepPct: 55,
    },
    hrvTrend14: [72, 70, 68, 66, 62, 58, 60, 56, 54, 52, 55, 53, 50, 54],
    priorNotes: [
      { date: "apr 10", quote: "hip feels locked up since the half-marathon" },
      { date: "apr 03", quote: "left trap been bothering me for a week" },
    ],
    recurringThemes: [
      { t: "left trap", n: 4 },
      { t: "low back", n: 3 },
      { t: "sleep quality", n: 3 },
      { t: "hip flexor (R)", n: 2 },
      { t: "post-race recovery", n: 2 },
    ],
  },
  {
    id: "devon-park",
    name: "Devon Park",
    initials: "DP",
    age: 41,
    profile: "first visit in 6 weeks",
    pairedOn: "2 months ago",
    sessionCount: 4,
    nextBookedOn: null,
    latest: {
      hrvMs: 61,
      hrvTrendPct: -4,
      restingHrBpm: 62,
      restingHrDelta: 2,
      sleepLabel: "6:40",
      sleepPct: 68,
    },
    hrvTrend14: [68, 66, 67, 64, 62, 60, 61, 58, 60, 62, 63, 61, 62, 60],
    priorNotes: [],
    recurringThemes: [],
  },
  {
    id: "jessica-park",
    name: "Jessica Park",
    initials: "JP",
    age: 37,
    profile: "post-injury recovery",
    pairedOn: "3 months ago",
    sessionCount: 11,
    nextBookedOn: null,
    latest: {
      hrvMs: 48,
      hrvTrendPct: -14,
      restingHrBpm: 70,
      restingHrDelta: 5,
      sleepLabel: "5:12",
      sleepPct: 48,
    },
    hrvTrend14: [62, 60, 58, 56, 54, 52, 50, 48, 50, 49, 48, 47, 48, 48],
    priorNotes: [{ date: "apr 01", quote: "shoulder still locked" }],
    recurringThemes: [{ t: "shoulder (L)", n: 6 }],
  },
];

export const TODAY_SLOTS: Slot[] = [
  { time: "9:00", clientId: "devon-park", tag: "returning · 4th", readiness: 78, protocol: "Recovery · warm", state: "done" },
  { time: "10:15", clientId: "jessica-park", tag: "returning · 11th", readiness: 56, protocol: "Shoulder asymmetry", state: "done" },
  { time: "11:30", clientId: "jordan-kim", tag: "returning · 7th", readiness: 54, protocol: "Parasympathetic · 40Hz", state: "now" },
  { time: "2:00", clientId: "devon-park", tag: "returning · 5th", readiness: 68, protocol: "Recovery · cool", state: "soon" },
];

export const RELAPSE_FLAGS: Flag[] = [
  {
    clientId: "jessica-park",
    severity: "high",
    reason:
      "HRV down 14% over 8 days, shoulder pain flagged in last session, 17 days since visit.",
    signals: ["HRV ↓ 14% · 8 days", '"shoulder still locked" · apr 1', "17d since visit"],
    lastVisit: "Apr 1",
    hrvTrend: [62, 60, 58, 56, 54, 52, 50, 48],
  },
  {
    clientId: "devon-park",
    severity: "medium",
    reason: "Sleep score trending down. First visit in 6 weeks.",
    signals: ["42 days since visit", "sleep score 58 · last 5 nights"],
    lastVisit: "Mar 6",
    hrvTrend: [68, 66, 67, 64, 62, 60, 61, 58],
  },
];

export const ACTIVE_CLIENT_ID = "jordan-kim";

export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}
