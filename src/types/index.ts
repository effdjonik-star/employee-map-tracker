export type EmployeeStatus = "active" | "idle" | "offline" | "unknown";

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Employee {
  id: string;
  name: string;
  telegram_user_id?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLocation {
  id: string;
  employee_id: string;
  employee?: Employee;
  address: string;
  lat: number;
  lng: number;
  status: EmployeeStatus;
  timestamp: string;
  telegram_message_id?: number | null;
  raw_message?: string | null;
  geocoded: boolean;
  created_at: string;
}

export interface EmployeeWithLocation extends Employee {
  latest_location?: EmployeeLocation | null;
}

export interface ParsedTelegramMessage {
  employeeName: string;
  address: string;
  coordinates?: GeoCoordinates;
  timestamp: string;
  status: EmployeeStatus;
  rawText: string;
  messageId: number;
}

export interface MapMarker {
  id: string;
  employeeId: string;
  employeeName: string;
  lat: number;
  lng: number;
  address: string;
  status: EmployeeStatus;
  timestamp: string;
  avatarUrl?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  activeNow: number;
  idleCount: number;
  offlineCount: number;
  lastUpdated: string;
}

export type SortField = "name" | "timestamp" | "status";
export type SortDirection = "asc" | "desc";

export interface LocationFilter {
  status?: EmployeeStatus | "all";
  search?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export interface RealtimeLocationPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  newRecord?: EmployeeLocation;
  oldRecord?: EmployeeLocation;
}
