"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeAddress } from "@/lib/geocoding";
import type {
  Employee,
  EmployeeLocation,
  EmployeeWithLocation,
  DashboardStats,
  LocationFilter,
  ParsedTelegramMessage,
} from "@/types";
import { revalidatePath } from "next/cache";

export async function upsertEmployeeLocation(
  parsed: ParsedTelegramMessage
): Promise<{ success: boolean; locationId?: string; error?: string }> {
  const supabase = createAdminClient();

  try {
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .upsert({ name: parsed.employeeName }, { onConflict: "name", ignoreDuplicates: false })
      .select("id, name")
      .single();

    if (empError || !employee) {
      return { success: false, error: empError?.message };
    }

    let lat = parsed.coordinates?.lat ?? null;
    let lng = parsed.coordinates?.lng ?? null;
    let geocoded = !!parsed.coordinates;

    if (lat === null || lng === null) {
      const coords = await geocodeAddress(parsed.address);
      if (coords) { lat = coords.lat; lng = coords.lng; geocoded = true; }
    }

    if (lat === null || lng === null) {
      return { success: false, error: `Could not geocode address: ${parsed.address}` };
    }

    if (parsed.messageId) {
      const { data: existing } = await supabase
        .from("employee_locations")
        .select("id")
        .eq("employee_id", employee.id)
        .eq("telegram_message_id", parsed.messageId)
        .maybeSingle();
      if (existing) return { success: true, locationId: existing.id };
    }

    const { data: location, error: locError } = await supabase
      .from("employee_locations")
      .insert({
        employee_id: employee.id,
        address: parsed.address,
        lat, lng,
        status: parsed.status,
        timestamp: parsed.timestamp,
        telegram_message_id: parsed.messageId ?? null,
        raw_message: parsed.rawText,
        geocoded,
      })
      .select("id")
      .single();

    if (locError || !location) {
      return { success: false, error: locError?.message };
    }

    revalidatePath("/dashboard");
    return { success: true, locationId: location.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

export async function getEmployeesWithLocations(
  filter?: LocationFilter
): Promise<EmployeeWithLocation[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("employees")
    .select(`*, latest_location:employee_locations(id, address, lat, lng, status, timestamp, geocoded, created_at)`)
    .order("name");

  if (error) return [];

  const employees = (data ?? []).map((emp) => {
    const locations = Array.isArray(emp.latest_location)
      ? emp.latest_location
      : emp.latest_location ? [emp.latest_location] : [];

    const latest = locations.sort(
      (a: EmployeeLocation, b: EmployeeLocation) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0] ?? null;

    return { ...emp, latest_location: latest };
  }) as EmployeeWithLocation[];

  let result = employees;

  if (filter?.status && filter.status !== "all") {
    result = result.filter((e) => e.latest_location?.status === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (e) => e.name.toLowerCase().includes(q) ||
             e.latest_location?.address?.toLowerCase().includes(q)
    );
  }

  const sf = filter?.sortField ?? "name";
  const sd = filter?.sortDirection ?? "asc";
  result.sort((a, b) => {
    let aVal = "", bVal = "";
    if (sf === "name") { aVal = a.name; bVal = b.name; }
    else if (sf === "timestamp") { aVal = a.latest_location?.timestamp ?? ""; bVal = b.latest_location?.timestamp ?? ""; }
    else if (sf === "status") { aVal = a.latest_location?.status ?? ""; bVal = b.latest_location?.status ?? ""; }
    const cmp = aVal.localeCompare(bVal);
    return sd === "asc" ? cmp : -cmp;
  });

  return result;
}

export async function getEmployeeHistory(
  employeeId: string,
  limit = 50
): Promise<EmployeeLocation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employee_locations")
    .select("*")
    .eq("employee_id", employeeId)
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as EmployeeLocation[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const { count: total } = await supabase.from("employees").select("*", { count: "exact", head: true });
  const { data: latestLocs } = await supabase
    .from("employee_locations")
    .select("employee_id, status, timestamp")
    .order("timestamp", { ascending: false });

  const seen = new Set<string>();
  const latest: Array<{ status: string; timestamp: string }> = [];
  for (const loc of latestLocs ?? []) {
    if (!seen.has(loc.employee_id)) { seen.add(loc.employee_id); latest.push(loc); }
  }

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  let activeNow = 0, idleCount = 0, offlineCount = 0;
  for (const loc of latest) {
    const isRecent = new Date(loc.timestamp) > thirtyMinAgo;
    if (loc.status === "active" && isRecent) activeNow++;
    else if (loc.status === "idle") idleCount++;
    else offlineCount++;
  }

  return { totalEmployees: total ?? 0, activeNow, idleCount, offlineCount, lastUpdated: new Date().toISOString() };
}

export async function cleanupStaleLocations(): Promise<{ deleted: number; error?: string }> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: latestPerEmp } = await supabase
    .from("employee_locations")
    .select("id, employee_id, timestamp")
    .order("timestamp", { ascending: false });

  const latestIds = new Set<string>();
  const seen = new Set<string>();
  for (const loc of latestPerEmp ?? []) {
    if (!seen.has(loc.employee_id)) { seen.add(loc.employee_id); latestIds.add(loc.id); }
  }

  if (latestIds.size === 0) return { deleted: 0 };

  const { error, count } = await supabase
    .from("employee_locations")
    .delete({ count: "exact" })
    .lt("timestamp", cutoff)
    .not("id", "in", `(${[...latestIds].join(",")})`);

  if (error) return { deleted: 0, error: error.message };
  return { deleted: count ?? 0 };
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
  if (error) return null;
  return data as Employee;
}
