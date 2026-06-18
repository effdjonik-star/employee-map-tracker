import type { ParsedTelegramMessage, EmployeeStatus, GeoCoordinates } from "@/types";

const NAME_PATTERNS = [
  /(?:name|имя|сотрудник|employee|работник)[:\s]+([^\n,]+)/i,
  /^👤\s*(.+)$/im,
  /^\*{0,2}([А-ЯЁA-Z][а-яёa-z]+ [А-ЯЁA-Z][а-яёa-z]+)\*{0,2}/m,
];

const ADDRESS_PATTERNS = [
  /(?:address|адрес|location|локация|место)[:\s]+([^\n]+)/i,
  /^📍\s*(.+)$/im,
  /^🏠\s*(.+)$/im,
];

const COORDS_PATTERNS = [
  /(?:geo|координаты|coords?)[:\s]+(-?\d{1,3}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/i,
  /maps\.google\.com\/\?.*[@=](-?\d{1,3}\.\d{4,}),(-?\d{1,3}\.\d{4,})/i,
  /yandex\.ru\/maps\/.*ll=(-?\d{1,3}\.\d{4,})%2C(-?\d{1,3}\.\d{4,})/i,
  /\((-?\d{1,3}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})\)/,
  /(-?\d{1,3}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/,
];

const STATUS_PATTERNS = [
  /(?:status|статус)[:\s]+(\S+)/i,
  /^(?:🟢|🔵|🟡|🔴)\s*(.+)$/im,
];

const STATUS_MAP: Record<string, EmployeeStatus> = {
  active: "active", активен: "active", online: "active", онлайн: "active",
  idle: "idle", ожидание: "idle", пауза: "idle",
  offline: "offline", офлайн: "offline", недоступен: "offline",
};

function extractWithPatterns(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractCoordinates(text: string): GeoCoordinates | null {
  for (const pattern of COORDS_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1] && match?.[2]) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }
  return null;
}

function normalizeStatus(raw?: string | null): EmployeeStatus {
  if (!raw) return "unknown";
  return STATUS_MAP[raw.toLowerCase().trim()] ?? "unknown";
}

function extractTimestamp(text: string, messageDate?: number): string {
  const tsPattern = /(?:time|время|timestamp|дата)[:\s]+(.+)/i;
  const match = text.match(tsPattern);
  if (match?.[1]) {
    const parsed = new Date(match[1].trim());
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
  }
  if (messageDate) return new Date(messageDate * 1000).toISOString();
  return new Date().toISOString();
}

export function parseTelegramMessage(
  text: string,
  messageId: number,
  messageDate?: number
): ParsedTelegramMessage | null {
  if (!text?.trim()) return null;

  const employeeName = extractWithPatterns(text, NAME_PATTERNS);
  if (!employeeName) return null;

  const address = extractWithPatterns(text, ADDRESS_PATTERNS) ?? "Unknown address";
  const coordinates = extractCoordinates(text);
  const rawStatus = extractWithPatterns(text, STATUS_PATTERNS);
  const status = normalizeStatus(rawStatus);
  const timestamp = extractTimestamp(text, messageDate);

  return {
    employeeName: employeeName.trim(),
    address: address.trim(),
    coordinates: coordinates ?? undefined,
    timestamp,
    status,
    rawText: text,
    messageId,
  };
}

export function isLocationMessage(text: string): boolean {
  return [
    /(?:address|адрес|location|локация)/i,
    /📍/, /🏠/,
    /(?:name|имя|сотрудник|employee)/i,
    /👤/,
  ].some((p) => p.test(text));
}
