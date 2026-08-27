import { ItineraryConfig } from "../components/ItineraryView";
import { getCityById } from "../data/destinations";
import { GeneratedItineraryResult } from "./itineraryPlanner";
import { mergeSort } from "@dsa/sorting/mergeSort";

export interface CachedTripData {
  id: string;
  cityName: string;
  cityId: string;
  config: ItineraryConfig;
  result: GeneratedItineraryResult;
  timestamp: string;
  updatedAt: string;
}

const STORAGE_KEY_TRIPS = "heritage_pwa_cached_trips";
const STORAGE_KEY_LATEST_ID = "heritage_pwa_latest_trip_id";

/**
 * Save full generated itinerary data to browser storage (localStorage & ServiceWorker Cache)
 */
export function saveTripToOfflineCache(
  config: ItineraryConfig,
  result: GeneratedItineraryResult,
): CachedTripData {
  const city = getCityById(config.cityId);
  const cityName = city?.name || config.cityId;
  const tripId = `trip_${config.cityId}_${config.tripDays}d_${config.budget}_${config.strategy || "distance-first"}`;

  const nowIso = new Date().toISOString();

  const payload: CachedTripData = {
    id: tripId,
    cityName,
    cityId: config.cityId,
    config,
    result,
    timestamp: nowIso,
    updatedAt: nowIso,
  };

  try {
    // 1. Save to localStorage
    const existing = getAllOfflineTripsMap();
    existing[tripId] = payload;
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(existing));
    localStorage.setItem(STORAGE_KEY_LATEST_ID, tripId);

    // 2. Notify Service Worker Cache if active
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_TRIP_DATA",
        tripId,
        payload,
      });
    }
  } catch (err) {
    console.warn("Failed to store itinerary in localStorage:", err);
  }

  return payload;
}

/**
 * Retrieve map of all cached trips
 */
function getAllOfflineTripsMap(): Record<string, CachedTripData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIPS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Error reading cached trips from localStorage:", err);
    return {};
  }
}

/**
 * Get all cached trips as array sorted by update date descending
 */
export function getAllOfflineTrips(): CachedTripData[] {
  const map = getAllOfflineTripsMap();
  return mergeSort(Object.values(map),
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/**
 * Get the most recently generated or saved itinerary trip
 */
export function getLatestOfflineTrip(): CachedTripData | null {
  try {
    const latestId = localStorage.getItem(STORAGE_KEY_LATEST_ID);
    const map = getAllOfflineTripsMap();
    if (latestId && map[latestId]) {
      return map[latestId];
    }
    const all = getAllOfflineTrips();
    return all.length > 0 ? all[0] : null;
  } catch (err) {
    return null;
  }
}

/**
 * Register Service Worker for PWA functionality
 */
export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator && process.env.NODE_ENV !== "development") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log(
            "Heritage PWA ServiceWorker registered with scope:",
            reg.scope,
          );
        })
        .catch((err) => {
          console.warn("ServiceWorker registration failed:", err);
        });
    });
  }
}
