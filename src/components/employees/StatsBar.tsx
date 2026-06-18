import { Users, Activity, Clock, WifiOff } from "lucide-react";
import type { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsBarProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

const statItems = [
  { key: "totalEmployees" as const, label: "Total", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "activeNow" as const, label: "Active", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "idleCount" as const, label: "Idle", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "offlineCount" as const, label: "Offline", icon: WifiOff, color: "text-slate-400", bg: "bg-slate-500/10" },
];

export function StatsBar({ stats, loading }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {statItems.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className={`mb-1.5 rounded-lg p-1.5 ${bg}`}>
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>
          {loading ? (
            <Skeleton className="mb-0.5 h-5 w-6 bg-white/[0.06]" />
          ) : (
            <p className={`text-lg font-bold leading-none ${color}`}>{stats?.[key] ?? 0}</p>
          )}
          <p className="mt-1 text-[10px] text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
