function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const env = {
  insforgeApiKey: required("INSFORGE_API_KEY"),
  insforgeApiBaseUrl: required("INSFORGE_API_BASE_URL"),
  insforgeAnonKey: required("INSFORGE_ANON_KEY"),
  elevenlabsApiKey: required("ELEVENLABS_API_KEY"),
  demoClientId: process.env.DEMO_CLIENT_ID ?? "marcus-rivera",
  demoPractitionerId: process.env.DEMO_PRACTITIONER_ID ?? "maya-reyes",
} as const;
