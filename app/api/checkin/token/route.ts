import { NextResponse } from "next/server";
import { encodeToken } from "@/lib/session-token";
import { randomBytes } from "crypto";

export async function GET() {
  const practitionerId = process.env.DEMO_PRACTITIONER_ID ?? "maya-reyes";
  const nonce = randomBytes(8).toString("hex");
  const ts = Date.now();
  const token = encodeToken({ practitionerId, nonce, ts });
  const expiresAt = new Date(ts + 5 * 60 * 1000).toISOString();
  return NextResponse.json({ token, expiresAt });
}
