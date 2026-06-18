"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { EmployeeWithLocation, DashboardStats, LocationFilter } from "@/types";

interface UseEmployeeLocationsResult {
  employees: EmployeeWithLocation[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isConnected: boolean;
}

export function useEmployeeLocations(filter?: LocationFilter): UseEmployeeLocationsResult {
  const [employees, setEmployees] = useState<EmployeeWithLocation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseRef = useRef<any>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== "all") params.set("status", filter.status);
    if (filter?.search) params.set("search", filter.search);
    if (filter?.sortField) params.set("sort", filter.sortField);
    if (filter?.sortDirection) params.set("dir", filter.sortDirection);
    return `/api/employees?${params.toString()}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.status, filter?.search, filter?.sortField, filter?.sortDirection]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(buildQuery(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setEmployees(json.employees ?? []);
      setStats(json.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch error");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;

    async function setupRealtime() {
      const { createClient } = await import("@/lib/supabase/client");
      if (cancelled) return;
      const supabase = createClient();
      supabaseRef.current = supabase;

      const channel = supabase
        .channel("employee_locations_realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "employee_locations" }, () => fetchData())
        .subscribe((status: string) => {
          if (!cancelled) setIsConnected(status === "SUBSCRIBED");
        });

      channelRef.current = channel;
    }

    setupRealtime();

    return () => {
      cancelled = true;
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
      }
    };
  }, [fetchData]);

  return { employees, stats, loading, error, refresh: fetchData, isConnected };
}
