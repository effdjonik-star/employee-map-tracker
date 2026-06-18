"use client";

import { useMemo } from "react";
import type { EmployeeWithLocation, MapMarker } from "@/types";

export function useMapMarkers(employees: EmployeeWithLocation[]): MapMarker[] {
  return useMemo(() => {
    return employees
      .filter((emp) => emp.latest_location?.lat != null && emp.latest_location?.lng != null)
      .map((emp) => ({
        id: emp.latest_location!.id,
        employeeId: emp.id,
        employeeName: emp.name,
        lat: emp.latest_location!.lat,
        lng: emp.latest_location!.lng,
        address: emp.latest_location!.address,
        status: emp.latest_location!.status,
        timestamp: emp.latest_location!.timestamp,
        avatarUrl: emp.avatar_url,
      }));
  }, [employees]);
}
