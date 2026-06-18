import { geocodeAddress as nominatimGeocode } from "./nominatim";
import type { GeoCoordinates } from "@/types";

export async function geocodeAddress(
  address: string
): Promise<GeoCoordinates | null> {
  const provider = process.env.GEOCODING_PROVIDER ?? "nominatim";
  switch (provider) {
    case "nominatim":
    default:
      return nominatimGeocode(address);
  }
}

export { reverseGeocode } from "./nominatim";
