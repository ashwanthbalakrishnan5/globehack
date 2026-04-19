/**
 * Hydrawav3 device control over MQTT.
 *
 * For the demo, the real endpoint is swapped in via env vars (base URL + MAC).
 * Until the hardware integration lands, this module just logs and returns a
 * mock response so the start/stop handshake is visible in the network tab.
 */

export type MqttAction = "start" | "stop";

export interface MqttResponse {
  ok: boolean;
  action: MqttAction;
  macId: string;
  at: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_MQTT_BASE_URL ?? "https://placeholder-mqtt.hydrawav3.local";
const DEFAULT_MAC =
  process.env.NEXT_PUBLIC_HYDRAWAV3_MAC_ID ?? "AA:BB:CC:DD:EE:FF";

async function send(action: MqttAction, macId: string): Promise<MqttResponse> {
  const payload: MqttResponse = {
    ok: true,
    action,
    macId,
    at: new Date().toISOString(),
  };

  if (BASE_URL.includes("placeholder")) {
    console.info(`[mqtt] ${action} ${macId} (placeholder, no network call)`);
    return payload;
  }

  try {
    const res = await fetch(`${BASE_URL}/devices/${encodeURIComponent(macId)}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ at: payload.at }),
    });
    if (!res.ok) {
      console.warn(`[mqtt] ${action} non-ok:`, res.status);
      return { ...payload, ok: false };
    }
    return payload;
  } catch (e) {
    console.warn(`[mqtt] ${action} failed:`, e);
    return { ...payload, ok: false };
  }
}

export function startDevice(macId: string = DEFAULT_MAC) {
  return send("start", macId);
}

export function stopDevice(macId: string = DEFAULT_MAC) {
  return send("stop", macId);
}
