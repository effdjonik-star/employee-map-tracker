"use client";

export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { StatsBar } from "@/components/employees/StatsBar";
import { useEmployeeLocations } from "@/hooks/useEmployeeLocations";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import type { EmployeeWithLocation } from "@/types";

const EmployeeMap = dynamicImport(
  () => import("@/components/map/EmployeeMap").then((mod) => mod.EmployeeMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/[0.02]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
          <p className="text-sm text-slate-500">Loading map…</p>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { employees, stats, loading, isConnected, refresh } = useEmployeeLocations();
  const markers = useMapMarkers(employees);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithLocation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950">
      <Header
        isConnected={isConnected}
        activeCount={stats?.activeNow ?? 0}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      <div className="flex min-h-0 flex-1 gap-0">
        <aside className="flex w-72 shrink-0 flex-col border-r border-white/[0.06] xl:w-80">
          <div className="border-b border-white/[0.06] p-3">
            <StatsBar stats={stats} loading={loading} />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <EmployeeList
              employees={employees}
              loading={loading}
              selectedId={selectedEmployee?.id}
              onSelect={(emp) => setSelectedEmployee((prev) => prev?.id === emp.id ? null : emp)}
            />
          </div>
        </aside>
        <main className="relative flex min-w-0 flex-1 flex-col p-3">
          <EmployeeMap
            markers={markers}
            selectedId={selectedEmployee?.id}
            onMarkerClick={(m) => {
              const emp = employees.find((e) => e.id === m.employeeId);
              if (emp) setSelectedEmployee(emp);
            }}
          />
          <div className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
            <p className="text-xs text-slate-500">
              {markers.length} employee{markers.length !== 1 ? "s" : ""} on map
            </p>
            {stats?.lastUpdated && (
              <p className="text-xs text-slate-600">
                Updated {new Date(stats.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
