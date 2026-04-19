import type { Flag } from "./types";

export interface DraftMessage {
  subject: string;
  body: string;
}

export function draftMessage(client: { name: string }, flag: Flag): DraftMessage {
  const firstName = client.name.split(" ")[0];
  const subject = `Checking in, ${firstName}`;

  const signalLines = flag.signals.slice(0, 2).map((s) => `  - ${s}`).join("\n");

  const body = `Hi ${firstName},

I wanted to reach out and see how you've been feeling since your last visit.

Your recovery signals have been on my mind:
${signalLines}

Hydrawav3 sessions can help support your nervous system as it works through this phase. Even a short 10-minute session can make a meaningful difference in your HRV trajectory.

Would you like to schedule some time this week? I have availability and would love to help you get back on track.

Take care,
Maya
Stillwater Recovery`;

  return { subject, body };
}
