"use client";

import { MapPin, Clock, Navigation } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { formatRelativeTime } from "@/utils/status";
import type { EmployeeWithLocation } from "@/types";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: EmployeeWithLocation;
  isSelected?: boolean;
  onClick?: () => void;
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function EmployeeCard({ employee, isSelected, onClick }: EmployeeCardProps) {
  const loc = employee.latest_location;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-all duration-200",
        "hover:border-white/10 hover:bg-white/[0.04]",
        isSelected
          ? "border-blue-500/40 bg-blue-500/10 ring-1 ring-blue-500/20"
          : "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0 border border-white/10">
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-700 text-xs font-semibold text-white">
            {getInitials(employee.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-white">{employee.name}</p>
            {loc && <StatusBadge status={loc.status} size="sm" pulse />}
          </div>
          {loc ? (
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{loc.address}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{formatRelativeTime(loc.timestamp)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500">No location data</p>
          )}
        </div>
        {loc && isSelected && <Navigation className="h-3.5 w-3.5 shrink-0 text-blue-400" />}
      </div>
    </button>
  );
}
