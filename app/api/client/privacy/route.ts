import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const clientId = (body.clientId as string | undefined) ?? process.env.DEMO_CLIENT_ID ?? "marcus-rivera";
  const sharingEnabled = Boolean(body.sharingEnabled);

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
