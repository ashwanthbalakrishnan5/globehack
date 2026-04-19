"use client";

import { insforgeBrowser } from "./insforge";

type Handler<T = unknown> = (payload: T) => void;

function realtimeConfigured() {
  return (
    typeof process !== "undefined" &&
    !!process.env.NEXT_PUBLIC_INSFORGE_URL &&
    !!process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
  );
}

export function subscribeChannel<T = unknown>(
  channel: string,
  event: string,
  handler: Handler<T>
): () => void {
  if (!realtimeConfigured()) return () => {};

  let active = true;
  let client: ReturnType<typeof insforgeBrowser> | null = null;

  try {
    client = insforgeBrowser();
  } catch {
    return () => {};
  }

  const wrappedHandler = (payload: unknown) => {
    if (!active) return;
    try {
      handler(payload as T);
    } catch (err) {
      console.warn(`[realtime] handler for ${channel}:${event} threw`, err);
    }
  };

  client.realtime
    .connect()
    .then(async () => {
      if (!active || !client) return;
      try {
        const result = await client.realtime.subscribe(channel);
        if (!result.ok) {
          console.warn(`[realtime] subscribe to ${channel} denied:`, result.error?.message);
          return;
        }
        if (!active) return;
        client.realtime.on<object>(event, wrappedHandler as (p: object) => void);
      } catch (err) {
        console.warn(`[realtime] subscribe failed for ${channel}`, err);
      }
    })
    .catch((err) => {
      console.warn(`[realtime] connect failed for ${channel}`, err);
    });

  return () => {
    active = false;
    if (!client) return;
    try {
      client.realtime.off(event, wrappedHandler as (p: object) => void);
      client.realtime.unsubscribe(channel);
    } catch {
      /* ignore */
    }
  };
}
