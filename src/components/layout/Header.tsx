"use client";

import { MapPin, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isConnected: boolean;
  activeCount: number;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function Header({ isConnected, activeCount, onRefresh, refreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
            <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Employee Map</span>
            <span className="ml-1.5 text-xs text-slate-500">Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="outline" className="hidden border-emerald-500/30 bg-emerald-500/10 text-emerald-400 sm:flex">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {activeCount} active
            </Badge>
          )}

          <Tooltip>
            <TooltipTrigger className={cn(
              "flex cursor-default items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
              isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="hidden sm:inline">{isConnected ? "Live" : "Offline"}</span>
            </TooltipTrigger>
            <TooltipContent>{isConnected ? "Real-time updates active" : "Reconnecting..."}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </TooltipTrigger>
            <TooltipContent>Refresh data</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
