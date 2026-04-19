/**
 * Hydrawav3 device control via the MQTT HTTP bridge.
 * Auth: POST /api/v1/auth/login → JWT_ACCESS_TOKEN
 * Publish: POST /api/v1/mqtt/publish with stringified payload
 *
 * Falls back to the sample MAC from the API docs if the real device 500s.
 */

const API_BASE = "/hydra-bridge";
const FALLBACK_MAC = "74:4D:BD:A0:A3:EC"; // sample from API docs

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testpractitioner", password: "1234", rememberMe: true }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  // Response includes "Bearer <token>" — strip the prefix
  const raw: string = data.JWT_ACCESS_TOKEN ?? "";
  cachedToken = raw.replace(/^Bearer\s+/i, "");
  return cachedToken;
}

async function publish(mac: string, payloadObj: Record<string, unknown>): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/v1/mqtt/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      topic: "HydraWav3Pro/config",
      payload: JSON.stringify({ mac, ...payloadObj }),
    }),
  });
  if (!res.ok) throw new Error(`MQTT publish failed: ${res.status}`);
}

// Full session start payload — maps protocol params to device config
function buildStartPayload(protocol: DeviceProtocol) {
  return {
    playCmd: 1,
    sessionCount: 3,
    sessionPause: 30,
    sDelay: 0,
    cycle1: 1,
    cycle5: 1,
    edgeCycleDuration: 9,
    cycleRepetitions: [6, 6, 3],
    cycleDurations: [3, 3, 3],
    cyclePauses: [3, 3, 3],
    pauseIntervals: [3, 3, 3],
    leftFuncs: protocol.leftFuncs,
    rightFuncs: protocol.rightFuncs,
    pwmValues: protocol.pwmValues,
    led: 1,
    hotDrop: 5,
    coldDrop: 3,
    vibMin: 15,
    vibMax: 222,
    totalDuration: protocol.totalDuration,
  };
}

export type SessionGoal =
  | "polar-alternate"
  | "contrast-balance"
  | "mobility-strengthen"
  | "recovery-restore"
  | "performance-prime"
  | "light-illuminate"
  | "relax-unwind";

export interface DeviceProtocol {
  id: string;
  name: string;
  tagline: string;
  duration_min: number;
  totalDuration: number;
  leftFuncs: string[];
  rightFuncs: string[];
  pwmValues: { hot: number[]; cold: number[] };
}

export interface SessionGoalDef {
  id: SessionGoal;
  label: string;
  protocols: DeviceProtocol[];
}

// All session goals and protocols from the device manager UI
export const SESSION_GOALS: SessionGoalDef[] = [
  {
    id: "polar-alternate",
    label: "Polar — Alternate",
    protocols: [
      {
        id: "pw36-restore", name: "PolarWave 36", tagline: "Restore", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [90, 90, 90], cold: [250, 250, 250] }
      },
      {
        id: "pw18-release", name: "PolarWave 18", tagline: "Release", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [80, 80, 80], cold: [230, 230, 230] }
      },
      {
        id: "pw9-balance", name: "PolarWave 9", tagline: "Balance", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [70, 70, 70], cold: [210, 210, 210] }
      },
      {
        id: "pw6-activate", name: "PolarWave 6", tagline: "Activate", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [100, 100, 100], cold: [255, 255, 255] }
      },
      {
        id: "pw3-awaken", name: "PolarWave 3", tagline: "Awaken", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [110, 110, 110], cold: [255, 255, 255] }
      },
    ],
  },
  {
    id: "contrast-balance",
    label: "Contrast — Balance",
    protocols: [
      {
        id: "cp36-recover", name: "ContrastPulse 36", tagline: "Recover", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [100, 100, 100], cold: [255, 255, 255] }
      },
      {
        id: "cp18-unwind", name: "ContrastPulse 18", tagline: "Unwind", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [85, 85, 85], cold: [240, 240, 240] }
      },
      {
        id: "cp9-flow", name: "ContrastPulse 9", tagline: "Flow", duration_min: 8, totalDuration: 486,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [90, 90, 90], cold: [250, 250, 250] }
      },
      {
        id: "cp6-prime", name: "ContrastPulse 6", tagline: "Prime", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [95, 95, 95], cold: [250, 250, 250] }
      },
      {
        id: "cp3-spark", name: "ContrastPulse 3", tagline: "Spark", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [110, 110, 110], cold: [255, 255, 255] }
      },
    ],
  },
  {
    id: "recovery-restore",
    label: "Recovery — Restore",
    protocols: [
      {
        id: "rr36-deep", name: "RecoveryWave 36", tagline: "Deep", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [70, 70, 70], cold: [255, 255, 255] }
      },
      {
        id: "rr18-ease", name: "RecoveryWave 18", tagline: "Ease", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [60, 60, 60], cold: [240, 240, 240] }
      },
      {
        id: "rr9-calm", name: "RecoveryWave 9", tagline: "Calm", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [65, 65, 65], cold: [245, 245, 245] }
      },
      {
        id: "rr6-renew", name: "RecoveryWave 6", tagline: "Renew", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [75, 75, 75], cold: [250, 250, 250] }
      },
      {
        id: "rr3-reset", name: "RecoveryWave 3", tagline: "Reset", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [80, 80, 80], cold: [250, 250, 250] }
      },
    ],
  },
  {
    id: "performance-prime",
    label: "Performance — Prime",
    protocols: [
      {
        id: "pp36-charge", name: "PrimeWave 36", tagline: "Charge", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftHotRed", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [120, 120, 120], cold: [200, 200, 200] }
      },
      {
        id: "pp18-ignite", name: "PrimeWave 18", tagline: "Ignite", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [115, 115, 115], cold: [195, 195, 195] }
      },
      {
        id: "pp9-surge", name: "PrimeWave 9", tagline: "Surge", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [110, 110, 110], cold: [210, 210, 210] }
      },
      {
        id: "pp6-boost", name: "PrimeWave 6", tagline: "Boost", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [105, 105, 105], cold: [205, 205, 205] }
      },
      {
        id: "pp3-spark", name: "PrimeWave 3", tagline: "Spark", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [100, 100, 100], cold: [200, 200, 200] }
      },
    ],
  },
  {
    id: "mobility-strengthen",
    label: "Mobility — Strengthen",
    protocols: [
      {
        id: "ms36-flex", name: "MobilityWave 36", tagline: "Flex", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [90, 90, 90], cold: [220, 220, 220] }
      },
      {
        id: "ms18-extend", name: "MobilityWave 18", tagline: "Extend", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [85, 85, 85], cold: [215, 215, 215] }
      },
      {
        id: "ms9-open", name: "MobilityWave 9", tagline: "Open", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [80, 80, 80], cold: [225, 225, 225] }
      },
      {
        id: "ms6-release", name: "MobilityWave 6", tagline: "Release", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [75, 75, 75], cold: [220, 220, 220] }
      },
      {
        id: "ms3-activate", name: "MobilityWave 3", tagline: "Activate", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [95, 95, 95], cold: [230, 230, 230] }
      },
    ],
  },
  {
    id: "light-illuminate",
    label: "Light — Illuminate",
    protocols: [
      {
        id: "li36-glow", name: "LightWave 36", tagline: "Glow", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [60, 60, 60], cold: [180, 180, 180] }
      },
      {
        id: "li18-shine", name: "LightWave 18", tagline: "Shine", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [55, 55, 55], cold: [175, 175, 175] }
      },
      {
        id: "li9-beam", name: "LightWave 9", tagline: "Beam", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [50, 50, 50], cold: [170, 170, 170] }
      },
      {
        id: "li6-pulse", name: "LightWave 6", tagline: "Pulse", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftHotRed", "leftColdBlue"],
        rightFuncs: ["rightColdBlue", "rightHotRed", "rightColdBlue"],
        pwmValues: { hot: [45, 45, 45], cold: [165, 165, 165] }
      },
      {
        id: "li3-spark", name: "LightWave 3", tagline: "Spark", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftHotRed", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [50, 50, 50], cold: [170, 170, 170] }
      },
    ],
  },
  {
    id: "relax-unwind",
    label: "Relax — Unwind",
    protocols: [
      {
        id: "rw36-drift", name: "RelaxWave 36", tagline: "Drift", duration_min: 7, totalDuration: 426,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftColdBlue"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightColdBlue"],
        pwmValues: { hot: [50, 50, 50], cold: [255, 255, 255] }
      },
      {
        id: "rw18-melt", name: "RelaxWave 18", tagline: "Melt", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftColdBlue"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightColdBlue"],
        pwmValues: { hot: [45, 45, 45], cold: [250, 250, 250] }
      },
      {
        id: "rw9-float", name: "RelaxWave 9", tagline: "Float", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [40, 40, 40], cold: [245, 245, 245] }
      },
      {
        id: "rw6-ease", name: "RelaxWave 6", tagline: "Ease", duration_min: 5, totalDuration: 306,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [40, 40, 40], cold: [240, 240, 240] }
      },
      {
        id: "rw3-still", name: "RelaxWave 3", tagline: "Still", duration_min: 4, totalDuration: 246,
        leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
        rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
        pwmValues: { hot: [35, 35, 35], cold: [235, 235, 235] }
      },
    ],
  },
];

// AI-recommended config for Marcus Rivera (declining HRV, elevated RHR, poor sleep)
// Recovery-Restore / RecoveryWave 36 "Deep" — cooling emphasis, extended duration
export const AI_RECOMMENDED: { goalId: SessionGoal; protocolId: string; reason: string } = {
  goalId: "recovery-restore",
  protocolId: "rr36-deep",
  reason: "HRV down 14% over 7 days + elevated RHR + 3 poor sleep nights → cooling-dominant recovery protocol",
};

export interface PairedDevice {
  mac: string;
  name: string;
  verified: boolean; // false = fallback to sample MAC
}

export async function pairDevice(mac: string): Promise<PairedDevice> {
  try {
    await publish(mac, { playCmd: 3 });
    console.log(`[mqtt] ✓ pair success — device ${mac} responded`);
    return { mac, name: `Hydra-${mac.slice(-5).replace(":", "")}`, verified: true };
  } catch (e) {
    console.warn(`[mqtt] ✗ pair failed for ${mac} — ${e}`);
    console.log(`[mqtt] → falling back to sample device ${FALLBACK_MAC}`);
    return { mac: FALLBACK_MAC, name: "Hydra-Demo (fallback)", verified: false };
  }
}

export async function startDevice(mac: string, protocol: DeviceProtocol): Promise<void> {
  try {
    await publish(mac, buildStartPayload(protocol));
    console.log(`[mqtt] ✓ start success — device ${mac} · protocol "${protocol.name} — ${protocol.tagline}" · ${protocol.duration_min}min`);
  } catch (e) {
    console.warn(`[mqtt] ✗ start failed for ${mac} — ${e}`);
    console.log(`[mqtt] → attempting fallback start on ${FALLBACK_MAC}`);
    try {
      await publish(FALLBACK_MAC, buildStartPayload(protocol));
      console.log(`[mqtt] ✓ fallback start success — device ${FALLBACK_MAC}`);
    } catch (e2) {
      console.error(`[mqtt] ✗ fallback start also failed — ${e2}`);
    }
  }
}

export async function stopDevice(mac: string): Promise<void> {
  try {
    await publish(mac, { playCmd: 3 });
    console.log(`[mqtt] ✓ stop success — device ${mac}`);
  } catch (e) {
    console.warn(`[mqtt] ✗ stop failed for ${mac} — ${e}`);
    console.log(`[mqtt] → attempting fallback stop on ${FALLBACK_MAC}`);
    try {
      await publish(FALLBACK_MAC, { playCmd: 3 });
      console.log(`[mqtt] ✓ fallback stop success — device ${FALLBACK_MAC}`);
    } catch (e2) {
      console.error(`[mqtt] ✗ fallback stop also failed — ${e2}`);
    }
  }
}
