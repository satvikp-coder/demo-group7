// The encoded preferences identify a persisted private trip; they do not carry its stops or grant access.

import { ItineraryConfig } from "../components/ItineraryView";
import { validWeights } from "../../../dsa/planning/priorities";

// 1: trip, city, days, budget, hotel, start time, sites, strategy.
// 2: adds travelers, rooms, lodging nights, dates, wheelchair flag, weights and hotel category.
const SHARE_VERSION = 2;

export interface SharedItineraryPayload extends ItineraryConfig {
  v?: number;
}

const isDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const isCount = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

// Keeps only well-formed optional preferences; anything invalid falls back to the planner default.
function optionalPreferences(payload: SharedItineraryPayload): Partial<ItineraryConfig> {
  const out: Partial<ItineraryConfig> = {};
  if (isCount(payload.travelers, 1, 20)) out.travelers = payload.travelers;
  if (isCount(payload.rooms, 1, 20)) out.rooms = payload.rooms;
  if (isCount(payload.lodgingNights, 0, 31)) out.lodgingNights = payload.lodgingNights;
  if (isDate(payload.arrivalDate)) out.arrivalDate = payload.arrivalDate;
  if (isDate(payload.departureDate)) out.departureDate = payload.departureDate;
  if (isDate(payload.startDate)) out.startDate = payload.startDate;
  if (typeof payload.wheelchairAccessibleOnly === "boolean") out.wheelchairAccessibleOnly = payload.wheelchairAccessibleOnly;
  if (validWeights(payload.weights)) out.weights = payload.weights;
  if (payload.hotelCategory === "Low Cost" || payload.hotelCategory === "Budget" || payload.hotelCategory === "Premium") out.hotelCategory = payload.hotelCategory;
  return out;
}

/**
 * Encodes an ItineraryConfig into a URL-safe string.
 */
export function encodeSharedItinerary(config: ItineraryConfig): string {
  try {
    const payload: SharedItineraryPayload = {
      tripId: config.tripId,
      cityId: config.cityId,
      tripDays: config.tripDays,
      budget: config.budget,
      startingHotelId: config.startingHotelId,
      startTime: config.startTime,
      selectedSites: config.selectedSites,
      strategy: config.strategy,
      travelers: config.travelers,
      rooms: config.rooms,
      lodgingNights: config.lodgingNights,
      arrivalDate: config.arrivalDate,
      departureDate: config.departureDate,
      startDate: config.startDate,
      wheelchairAccessibleOnly: config.wheelchairAccessibleOnly,
      weights: config.weights,
      hotelCategory: config.hotelCategory,
      v: SHARE_VERSION,
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
    // Version 1 links (and links with no version) carry no extra preferences; they decode with defaults.
    // A link from a newer app version is rejected instead of being silently misread.
    if (typeof payload?.v === "number" && payload.v > SHARE_VERSION) return null;
    if (payload && typeof payload.cityId === "string" && payload.cityId) {
      return {
        tripId: payload.tripId,
        cityId: payload.cityId,
        tripDays: payload.tripDays || 2,
        budget: payload.budget || 8500,
        startingHotelId: payload.startingHotelId,
        startTime: payload.startTime || "08:00 AM",
        selectedSites: payload.selectedSites,
        strategy: payload.strategy,
        ...optionalPreferences(payload),
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

export type SharedUrlParseResult =
  | { success: true; config: ItineraryConfig; isReadOnly: boolean }
  | { success: false; error: string; rawPayload: string }
  | null;

/**
 * Parses current window.location for any shared itinerary payload.
 */
export function getSharedFromUrl(): SharedUrlParseResult {
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
      success: true,
      config: decodedConfig,
      isReadOnly: true,
    };
  }

  return {
    success: false,
    error: "Malformed or corrupted itinerary parameters in share link.",
    rawPayload: encoded,
  };
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
