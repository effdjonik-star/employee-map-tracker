import { getStatusConfig } from "@/utils/status";
import type { EmployeeStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: EmployeeStatus;
  size?: "sm" | "md";
  pulse?: boolean;
}

export function StatusBadge({ status, size = "md", pulse = false }: StatusBadgeProps) {
  const cfg = getStatusConfig(status);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
      cfg.bg, cfg.color,
      size === "sm" && "px-1.5 py-px text-[10px]"
    )}>
      <span className={cn(
        "rounded-full",
        cfg.dot,
        size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5",
        pulse && status === "active" && "animate-pulse"
      )} />
      {cfg.label}
    </span>
  );
}
