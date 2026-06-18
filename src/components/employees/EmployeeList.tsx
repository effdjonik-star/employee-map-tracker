"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeCard } from "./EmployeeCard";
import type { EmployeeWithLocation, EmployeeStatus } from "@/types";

interface EmployeeListProps {
  employees: EmployeeWithLocation[];
  loading: boolean;
  selectedId?: string;
  onSelect: (employee: EmployeeWithLocation) => void;
}

export function EmployeeList({ employees, loading, selectedId, onSelect }: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">("all");

  const filtered = useMemo(() => employees.filter((emp) => {
    const matchesSearch = !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.latest_location?.address?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.latest_location?.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [employees, search, statusFilter]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-3">
        <Users className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-white">Employees</span>
        <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">{filtered.length}</span>
      </div>
      <div className="space-y-2 border-b border-white/[0.06] p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-white/[0.08] bg-white/[0.03] pl-8 text-xs text-white placeholder:text-slate-600 focus-visible:border-blue-500/50 focus-visible:ring-0"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EmployeeStatus | "all")}>
          <SelectTrigger className="h-8 border-white/[0.08] bg-white/[0.03] text-xs text-slate-300">
            <SlidersHorizontal className="mr-2 h-3 w-3" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900 text-white">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-xl bg-white/[0.04]" />
            ))
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center"><p className="text-sm text-slate-500">No employees found</p></div>
          ) : (
            filtered.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} isSelected={selectedId === emp.id} onClick={() => onSelect(emp)} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
