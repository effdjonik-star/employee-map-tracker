"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/employees/StatusBadge";
import { formatRelativeTime } from "@/utils/status";
import type { EmployeeLocation } from "@/types";

export default function HistoryContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const employeeName = searchParams.get("name");
  const [history, setHistory] = useState<EmployeeLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }
    fetch(`/api/employees/${employeeId}/history`)
      .then((r) => r.json())
      .then((j) => setHistory(j.history ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [employeeId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950">
      <header className="border-b border-white/[0.06] bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">Location History</h1>
            {employeeName && <p className="text-xs text-slate-500">{employeeName}</p>}
          </div>
          <Badge variant="outline" className="ml-auto border-white/10 bg-white/[0.04] text-slate-400">
            {history.length} records
          </Badge>
        </div>
      </header>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-2 p-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl bg-white/[0.04]" />
            ))
          ) : history.length === 0 ? (
            <div className="py-20 text-center">
              <Activity className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">{employeeId ? "No history available" : "No employee selected"}</p>
            </div>
          ) : (
            history.map((loc, idx) => (
              <div key={loc.id} className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                {idx < history.length - 1 && (
                  <div className="absolute bottom-0 left-7 top-full h-2 w-px bg-white/[0.06]" />
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs text-slate-500">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={loc.status} size="sm" />
                      <span className="text-xs text-slate-500">{formatRelativeTime(loc.timestamp)}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                        <span>{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0 text-slate-500" />
                        <span className="text-slate-500">{new Date(loc.timestamp).toLocaleString()}</span>
                      </div>
                      {loc.lat && loc.lng && (
                        <div className="text-slate-600">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
