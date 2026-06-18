import type { EmployeeStatus } from "@/types";

export const STATUS_CONFIG: Record<
  EmployeeStatus,
  { label: string; color: string; bg: string; dot: string; markerColor: string }
> = {
  active: {
    label: "Active",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20 border-emerald-500/40",
    dot: "bg-emerald-400",
    markerColor: "#10b981",
  },
  idle: {
    label: "Idle",
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/40",
    dot: "bg-amber-400",
    markerColor: "#f59e0b",
  },
  offline: {
    label: "Offline",
    color: "text-slate-400",
    bg: "bg-slate-500/20 border-slate-500/40",
    dot: "bg-slate-400",
    markerColor: "#64748b",
  },
  unknown: {
    label: "Unknown",
    color: "text-rose-400",
    bg: "bg-rose-500/20 border-rose-500/40",
    dot: "bg-rose-400",
    markerColor: "#f43f5e",
  },
};

export function getStatusConfig(status: EmployeeStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isStale(isoString: string, thresholdMinutes = 30): boolean {
  const diff = Date.now() - new Date(isoString).getTime();
  return diff > thresholdMinutes * 60_000;
}
