// NOTE: Once a backend exists, this client-side URL encoding approach should be replaced with a database-backed share link (e.g. /trips/:id/share/:token) to avoid long URLs for complex itineraries -- this client-only version is a reasonable interim approach given no backend yet.

import { ItineraryConfig } from "../components/ItineraryView";

export interface SharedItineraryPayload extends ItineraryConfig {
  v?: number;
}

/**
 * Encodes an ItineraryConfig into a URL-safe string.
 */
export function encodeSharedItinerary(config: ItineraryConfig): string {
  try {
    const payload: SharedItineraryPayload = {
      cityId: config.cityId,
      tripDays: config.tripDays,
      budget: config.budget,
      startingHotelId: config.startingHotelId,
      startTime: config.startTime,
      selectedSites: config.selectedSites,
      strategy: config.strategy,
      v: 1,
    };
    const jsonStr = JSON.stringify(payload);
    // Safe UTF-8 to Base64
    const base64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );
    // Replace URL non-safe chars
    return encodeURIComponent(base64);
  } catch (err) {
    console.error("Failed to encode shared itinerary payload:", err);
    return "";
  }
}

/**
 * Decodes a URL-safe Base64 string back into an ItineraryConfig.
 */
export function decodeSharedItinerary(
  encodedStr: string,
): ItineraryConfig | null {
  try {
    if (!encodedStr) return null;
    const decodedUri = decodeURIComponent(encodedStr);
    const jsonStr = decodeURIComponent(
      atob(decodedUri)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonStr) as SharedItineraryPayload;
    if (payload && payload.cityId) {
      return {
        cityId: payload.cityId,
        tripDays: payload.tripDays || 2,
        budget: payload.budget || 8500,
        startingHotelId: payload.startingHotelId,
        startTime: payload.startTime || "08:00 AM",
        selectedSites: payload.selectedSites,
        strategy: payload.strategy,
      };
    }
    return null;
  } catch (err) {
    console.error("Failed to decode shared itinerary payload:", err);
    return null;
  }
}

/**
 * Generates the full shareable link for a given itinerary config.
 */
export function getShareableUrl(config: ItineraryConfig): string {
  const encoded = encodeSharedItinerary(config);
  const origin = window.location.origin;
  const pathname =
    window.location.pathname === "/" ? "" : window.location.pathname;
  return `${origin}${pathname}?shared=${encoded}`;
}

/**
 * Parses current window.location for any shared itinerary payload.
 */
export function getSharedFromUrl(): {
  config: ItineraryConfig;
  isReadOnly: boolean;
} | null {
  if (typeof window === "undefined") return null;

  let encoded = "";

  // 1. Query parameter ?shared= or ?share=
  const searchParams = new URLSearchParams(window.location.search);
  const qVal = searchParams.get("shared") || searchParams.get("share");
  if (qVal) {
    encoded = qVal;
  }

  // 2. Path /shared/:encoded
  if (!encoded && window.location.pathname.includes("/shared/")) {
    const parts = window.location.pathname.split("/shared/");
    if (parts[1]) {
      encoded = parts[1];
    }
  }

  // 3. Hash #shared/:encoded or #shared=:encoded
  if (!encoded && window.location.hash.includes("shared")) {
    const hash = window.location.hash;
    if (hash.includes("/shared/")) {
      encoded = hash.split("/shared/")[1];
    } else if (hash.includes("shared=")) {
      encoded = hash.split("shared=")[1];
    }
  }

  if (!encoded) return null;

  const decodedConfig = decodeSharedItinerary(encoded);
  if (decodedConfig) {
    return {
      config: decodedConfig,
      isReadOnly: true,
    };
  }

  return null;
}

/**
 * Helper to clear shared parameters from current URL without reloading.
 */
export function clearSharedUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("shared");
  url.searchParams.delete("share");
  if (url.pathname.includes("/shared/")) {
    url.pathname = "/";
  }
  if (url.hash.includes("shared")) {
    url.hash = "";
  }
  window.history.replaceState({}, "", url.toString());
}
