import { NextRequest, NextResponse } from "next/server";
import { stopDevice } from "@/lib/mqtt";

export async function POST(req: NextRequest) {
  const { mac }: { mac: string } = await req.json();
  await stopDevice(mac);
  return NextResponse.json({ ok: true });
}
