export type Activity = "football" | "jogging" | "gym" | "marathon" | "yoga" | "rotator_cuff" | "desk";

export interface OnboardingQuestion {
  id: string;
  activity: Activity | "general";
  prompt: string;
  hint: string;
}

const CLIENT_ACTIVITIES: Record<string, Activity[]> = {
  "alina-zhou": ["football", "jogging", "gym", "desk"],
  "marcus-rivera": ["football", "jogging", "gym"],
  "sarah-chen": ["yoga"],
  "jessica-park": ["rotator_cuff", "gym"],
};

const BANK: Record<Activity, OnboardingQuestion[]> = {
  football: [
    { id: "football-freq", activity: "football", prompt: "How's the Saturday football been the last couple weeks? Still doing the pickup thing?", hint: "weekly cadence" },
    { id: "football-pain", activity: "football", prompt: "Anything hanging on from the last match? Knees, hips, lower back, groin?", hint: "post-match soreness" },
    { id: "football-effort", activity: "football", prompt: "When you're out there, how hard are you pushing, honestly? One to ten.", hint: "effort rating" },
  ],
  jogging: [
    { id: "jog-distance", activity: "jogging", prompt: "You've been pretty steady with running. What's the longest run you've done this month?", hint: "distance" },
    { id: "jog-surface", activity: "jogging", prompt: "Mostly road, trail, track? Any hill work?", hint: "surface + terrain" },
    { id: "jog-pain", activity: "jogging", prompt: "Anything showing up after the long runs? Knees, calves, lower back?", hint: "recovery signals" },
  ],
  gym: [
    { id: "gym-split", activity: "gym", prompt: "What's the lifting week looking like? Which days, which lifts?", hint: "split + volume" },
    { id: "gym-compound", activity: "gym", prompt: "Any of the heavy compounds giving you trouble? Squat, deadlift, overhead press?", hint: "compound lifts" },
    { id: "gym-shoulders", activity: "gym", prompt: "Any carryover tightness from lifting? Traps, rear delts, upper back?", hint: "upper body" },
  ],
  desk: [
    { id: "desk-hours", activity: "desk", prompt: "How much of your day is at the laptop? Ballpark hours.", hint: "screen time" },
    { id: "desk-tension", activity: "desk", prompt: "By the end of a long workday, where does your body start to complain?", hint: "posture tension" },
    { id: "desk-breaks", activity: "desk", prompt: "Do you get up and move during the day, or is it mostly sit and grind?", hint: "movement breaks" },
  ],
  marathon: [
    { id: "mar-plan", activity: "marathon", prompt: "Where are you in the training block right now?", hint: "base / peak / taper" },
  ],
  yoga: [
    { id: "yoga-style", activity: "yoga", prompt: "Vinyasa, yin, or a mix?", hint: "style" },
    { id: "yoga-pain", activity: "yoga", prompt: "Anything feeling locked up in the backbends or twists?", hint: "spine, hips" },
  ],
  rotator_cuff: [
    { id: "rc-phase", activity: "rotator_cuff", prompt: "How is the right shoulder behaving this week?", hint: "range, pain" },
    { id: "rc-pt", activity: "rotator_cuff", prompt: "How many PT sessions since we last met?", hint: "frequency" },
  ],
};

const GENERAL: OnboardingQuestion[] = [
  { id: "gen-sleep", activity: "general", prompt: "How's the sleep been the last few nights? Hours, and how you're feeling in the morning.", hint: "sleep + wake-up" },
  { id: "gen-stress", activity: "general", prompt: "Anything big going on outside training? Work stress, travel, deadlines?", hint: "life context" },
];

export function questionsForClient(clientId: string, profile?: string | null): OnboardingQuestion[] {
  const direct = CLIENT_ACTIVITIES[clientId];
  if (direct) {
    return [...direct.flatMap((a) => BANK[a]), ...GENERAL];
  }

  const inferred: Activity[] = [];
  const p = (profile ?? "").toLowerCase();
  if (/(marathon|runner|endurance)/.test(p)) inferred.push("jogging", "marathon");
  if (/yoga|pilates/.test(p)) inferred.push("yoga");
  if (/rotator|shoulder/.test(p)) inferred.push("rotator_cuff");
  if (/gym|lift/.test(p)) inferred.push("gym");
  if (/football|soccer/.test(p)) inferred.push("football");
  if (/desk|ux|designer|engineer|laptop/.test(p)) inferred.push("desk");

  if (inferred.length === 0) return GENERAL;
  return [...inferred.flatMap((a) => BANK[a]), ...GENERAL];
}
