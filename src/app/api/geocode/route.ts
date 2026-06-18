import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoding";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const address = req.nextUrl.searchParams.get("address");
  if (!address?.trim()) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }
  const coords = await geocodeAddress(address);
  if (!coords) {
    return NextResponse.json({ error: "Could not geocode address", address }, { status: 404 });
  }
  return NextResponse.json({ coords, address });
}
