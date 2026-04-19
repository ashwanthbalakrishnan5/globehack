import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

// In-memory store: survives across requests for the demo server session
const privacyStore = new Map<string, boolean>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

  if (clientId) {
    return NextResponse.json({ clientId, sharingEnabled: privacyStore.get(clientId) ?? true });
  }

  // Return all known states
  const all: Record<string, boolean> = {};
  privacyStore.forEach((v, k) => { all[k] = v; });
  return NextResponse.json({ states: all });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const clientId = (body.clientId as string | undefined) ?? process.env.DEMO_CLIENT_ID ?? "marcus-rivera";
  const sharingEnabled = Boolean(body.sharingEnabled);

  privacyStore.set(clientId, sharingEnabled);

  const db = insforgeServer();

  try {
    await db.realtime.connect();
    await db.realtime.subscribe(`privacy:${clientId}`);
    await db.realtime.publish(`privacy:${clientId}`, "sharing_changed", {
      clientId,
      sharingEnabled,
    });
  } catch (e) {
    console.warn("Realtime publish failed:", e);
  }

  return NextResponse.json({ ok: true, clientId, sharingEnabled });
}
