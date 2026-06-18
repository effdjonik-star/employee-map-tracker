import { NextRequest, NextResponse } from "next/server";
import { getEmployeesWithLocations, getDashboardStats } from "@/lib/actions/employees";
import type { LocationFilter, SortField, SortDirection, EmployeeStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const filter: LocationFilter = {
    status: (searchParams.get("status") as EmployeeStatus | "all") ?? "all",
    search: searchParams.get("search") ?? undefined,
    sortField: (searchParams.get("sort") as SortField) ?? "name",
    sortDirection: (searchParams.get("dir") as SortDirection) ?? "asc",
  };
  const [employees, stats] = await Promise.all([
    getEmployeesWithLocations(filter),
    getDashboardStats(),
  ]);
  return NextResponse.json({ employees, stats });
}
