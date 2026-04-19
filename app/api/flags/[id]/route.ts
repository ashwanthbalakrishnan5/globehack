import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = insforgeServer();

  await db.database
    .from("relapse_flags")
    .update({ addressed: true })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
