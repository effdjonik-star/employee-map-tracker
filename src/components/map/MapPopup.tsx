import { MapPin, Clock, User } from "lucide-react";
import { StatusBadge } from "@/components/employees/StatusBadge";
import { formatRelativeTime } from "@/utils/status";
import type { MapMarker } from "@/types";

interface MapPopupProps {
  marker: MapMarker;
}

export function MapPopup({ marker }: MapPopupProps) {
  return (
    <div className="min-w-[200px] font-sans">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
          {marker.employeeName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{marker.employeeName}</p>
          <StatusBadge status={marker.status} size="sm" />
        </div>
      </div>
      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
          <span className="leading-snug">{marker.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0 text-slate-400" />
          <span>{formatRelativeTime(marker.timestamp)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 shrink-0 text-slate-400" />
          <span className="text-slate-400">{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
