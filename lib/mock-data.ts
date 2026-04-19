/* Fallback mock data. Only used when Insforge reads fail. Do not extend. */

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
    id: "marcus-rivera",
    name: "Marcus Rivera",
    initials: "MR",
    age: 34,
    profile: "endurance athlete",
    pairedOn: "6 months ago",
    sessionCount: 7,
    nextBookedOn: "Apr 18",
    latest: {
      hrvMs: 50,
      hrvTrendPct: -18,
      restingHrBpm: 66,
      restingHrDelta: 8,
      sleepLabel: "5:42",
      sleepPct: 55,
    },
    hrvTrend14: [72, 70, 68, 65, 63, 67, 62, 60, 58, 55, 58, 54, 52, 50],
    priorNotes: [
      { date: "apr 11", quote: "Left trap is worse this week, honestly" },
      { date: "mar 24", quote: "left trap is a bit tight" },
    ],
    recurringThemes: [
      { t: "left trap", n: 4 },
      { t: "sleep quality", n: 3 },
      { t: "low back", n: 2 },
      { t: "post-race recovery", n: 2 },
    ],
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    initials: "SC",
    age: 41,
    profile: "returning after 6-week break",
    pairedOn: "7 months ago",
    sessionCount: 5,
    nextBookedOn: "Apr 18",
    latest: {
      hrvMs: 65,
      hrvTrendPct: -2,
      restingHrBpm: 57,
      restingHrDelta: 0,
      sleepLabel: "7:10",
      sleepPct: 82,
    },
    hrvTrend14: [64, 66, 65, 63, 67, 65, 64, 66, 65, 63, 66, 65, 64, 65],
    priorNotes: [
      { date: "mar 29", quote: "I feel more centered after each session" },
    ],
    recurringThemes: [
      { t: "stress", n: 2 },
      { t: "shoulder", n: 1 },
    ],
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
  { time: "9:00", clientId: "sarah-chen", tag: "returning · 4th", readiness: 82, protocol: "Standard Balance", state: "done" },
  { time: "10:15", clientId: "jessica-park", tag: "returning · 11th", readiness: 56, protocol: "Shoulder asymmetry", state: "done" },
  { time: "11:30", clientId: "marcus-rivera", tag: "returning · 7th", readiness: 54, protocol: "Parasympathetic · 40Hz", state: "now" },
  { time: "2:00", clientId: "sarah-chen", tag: "returning · 5th", readiness: 68, protocol: "Recovery · cool", state: "soon" },
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
];

export const ACTIVE_CLIENT_ID = "marcus-rivera";

export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}
