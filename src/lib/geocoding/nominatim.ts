import type { GeoCoordinates } from "@/types";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "employee-map-tracker/1.0 (contact@example.com)";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
}

export async function geocodeAddress(
  address: string
): Promise<GeoCoordinates | null> {
  if (!address?.trim()) return null;

  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", address.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("[Nominatim] HTTP error:", res.status, res.statusText);
      return null;
    }

    const results: NominatimResult[] = await res.json();
    if (!results.length) return null;

    const { lat, lon } = results[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  } catch (err) {
    console.error("[Nominatim] fetch error:", err);
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lng.toString());
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data as { display_name?: string }).display_name ?? null;
  } catch {
    return null;
  }
}
