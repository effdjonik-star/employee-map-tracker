import { NextRequest, NextResponse } from "next/server";
import { cleanupStaleLocations } from "@/lib/actions/employees";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await cleanupStaleLocations();
  return NextResponse.json({ ok: true, deleted: result.deleted, error: result.error, timestamp: new Date().toISOString() });
}
