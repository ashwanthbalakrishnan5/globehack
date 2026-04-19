"use client";

import { insforgeBrowser } from "./insforge";

type Handler<T = unknown> = (payload: T) => void;

export function subscribeChannel<T = unknown>(
  channel: string,
  event: string,
  handler: Handler<T>
): () => void {
  const client = insforgeBrowser();

  client.realtime.connect().then(() => {
    client.realtime.subscribe(channel);
    client.realtime.on<T & object>(event, (payload) => handler(payload));
  });

  return () => {
    client.realtime.unsubscribe(channel);
  };
}
