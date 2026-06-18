import { NextRequest, NextResponse } from "next/server";
import { getEmployeeHistory } from "@/lib/actions/employees";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]/history">
): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
  const history = await getEmployeeHistory(id, 100);
  return NextResponse.json({ history });
}
