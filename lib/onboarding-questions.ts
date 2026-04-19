export type Activity = "football" | "jogging" | "gym" | "marathon" | "yoga" | "rotator_cuff";

export interface OnboardingQuestion {
  id: string;
  activity: Activity | "general";
  prompt: string;
  hint: string;
}

const CLIENT_ACTIVITIES: Record<string, Activity[]> = {
  "marcus-rivera": ["football", "jogging", "gym"],
  "sarah-chen": ["yoga"],
  "jessica-park": ["rotator_cuff", "gym"],
};

const BANK: Record<Activity, OnboardingQuestion[]> = {
  football: [
    { id: "football-freq", activity: "football", prompt: "How often are you on the pitch this month?", hint: "sessions per week" },
    { id: "football-pain", activity: "football", prompt: "Anywhere tight after the last match? Knees, hips, lower back?", hint: "mark zones as they come up" },
    { id: "football-effort", activity: "football", prompt: "How hard did you push last game on a 1-10?", hint: "effort rating" },
  ],
  jogging: [
    { id: "jog-distance", activity: "jogging", prompt: "What distance are you covering on your long run?", hint: "miles" },
    { id: "jog-surface", activity: "jogging", prompt: "Road, track, or trail mostly?", hint: "surface" },
    { id: "jog-pain", activity: "jogging", prompt: "Any sharpness in the knees or calves after?", hint: "mark zones" },
  ],
  gym: [
    { id: "gym-split", activity: "gym", prompt: "What split are you running, and how many lifts per week?", hint: "volume" },
    { id: "gym-compound", activity: "gym", prompt: "Squats, deadlifts, or presses giving you trouble?", hint: "compound lifts" },
    { id: "gym-shoulders", activity: "gym", prompt: "Any trap or shoulder tightness carrying over from lifts?", hint: "upper body" },
  ],
  marathon: [
    { id: "mar-plan", activity: "marathon", prompt: "Where are you in the training block?", hint: "peak, taper, base" },
  ],
  yoga: [
    { id: "yoga-style", activity: "yoga", prompt: "Vinyasa, yin, or a mix?", hint: "style" },
    { id: "yoga-pain", activity: "yoga", prompt: "Any areas feeling locked up in backbends or twists?", hint: "spine, hips" },
  ],
  rotator_cuff: [
    { id: "rc-phase", activity: "rotator_cuff", prompt: "How is the right shoulder behaving this week?", hint: "range, pain" },
    { id: "rc-pt", activity: "rotator_cuff", prompt: "How many PT sessions since we last met?", hint: "frequency" },
  ],
};

const GENERAL: OnboardingQuestion[] = [
  { id: "gen-sleep", activity: "general", prompt: "How has sleep been the last few nights?", hint: "hours, quality" },
  { id: "gen-stress", activity: "general", prompt: "Any big stress or travel this week?", hint: "context" },
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

  if (inferred.length === 0) return GENERAL;
  return [...inferred.flatMap((a) => BANK[a]), ...GENERAL];
}
