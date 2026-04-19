import { NextRequest, NextResponse } from "next/server";
import { startDevice } from "@/lib/mqtt";
import type { DeviceProtocol } from "@/lib/mqtt";

export async function POST(req: NextRequest) {
  const { mac, protocol }: { mac: string; protocol: DeviceProtocol } = await req.json();
  await startDevice(mac, protocol);
  return NextResponse.json({ ok: true });
}
