import { ItineraryConfig } from "../components/ItineraryView";

import type { GeneratedItineraryResult } from "./itineraryPlanner";
import { mergeSort } from "@dsa/sorting/mergeSort";

export interface CachedTripData {
  id: string;
  cityName: string;
  cityId: string;
  config: ItineraryConfig;
  result: GeneratedItineraryResult;
  /** The saved trip as returned by the API (budget, days, summary), needed to render the itinerary view. */
  dto?: unknown;
  timestamp: string;
  updatedAt: string;
}

const STORAGE_KEY_TRIPS = "heritage_pwa_cached_trips";
const STORAGE_KEY_LATEST_ID = "heritage_pwa_latest_trip_id";
const MAX_OFFLINE_TRIPS = 10;

// Saved itineraries use NaN for "not available" values; plain JSON would turn them into null.
const NON_FINITE = "__nonFinite__";
const encode = (value: unknown) =>
  JSON.stringify(value, (_key, item) => (typeof item === "number" && !Number.isFinite(item) ? { [NON_FINITE]: String(item) } : item));
const decode = (text: string) =>
  JSON.parse(text, (_key, item) => (item && typeof item === "object" && NON_FINITE in item ? Number(item[NON_FINITE]) : item));

/**
 * Save full generated itinerary data to browser storage (localStorage & ServiceWorker Cache)
 */
export function saveTripToOfflineCache(
  config: ItineraryConfig,
  result: GeneratedItineraryResult,
  dto?: unknown,
): CachedTripData {
  const cityName = result.activeCity.name;
  // A persisted trip is keyed by its own id so two trips with the same settings never overwrite each other.
  const tripId = config.tripId
    ? `trip_${config.tripId}`
    : `trip_${config.cityId}_${config.tripDays}d_${config.budget}_${config.strategy || "distance-first"}`;

  const nowIso = new Date().toISOString();

  const payload: CachedTripData = {
    id: tripId,
    cityName,
    cityId: config.cityId,
    config,
    result,
    dto,
    timestamp: nowIso,
    updatedAt: nowIso,
  };

  try {
    // 1. Save to localStorage, keeping only the most recent trips so storage stays bounded
    const existing = getAllOfflineTripsMap();
    delete existing[tripId]; // re-insert so this save is the most recent entry even when timestamps tie
    existing[tripId] = payload;
    const newest = Object.entries(existing)
      .reverse()
      .sort(([, a], [, b]) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_OFFLINE_TRIPS);
    localStorage.setItem(STORAGE_KEY_TRIPS, encode(Object.fromEntries(newest.reverse())));
    localStorage.setItem(STORAGE_KEY_LATEST_ID, tripId);

    // 2. Notify Service Worker Cache if active (without the API copy, which only localStorage reads)
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_TRIP_DATA",
        tripId,
        payload: { ...payload, dto: undefined },
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
    return raw ? decode(raw) : {};
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
  return mergeSort(Object.values(map).filter(trip => Boolean(trip.config.tripId)),
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
    if (latestId && map[latestId]?.config.tripId) {
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

/** Remove only snapshots of a trip whose server deletion succeeded. */
export function removeTripFromOfflineCache(serverTripId:string):void {
  const map=getAllOfflineTripsMap();
  const keys=Object.keys(map).filter(key=>map[key]?.config?.tripId===serverTripId);
  if(!keys.length)return;
  for(const key of keys)delete map[key];
  localStorage.setItem(STORAGE_KEY_TRIPS,encode(map));
  if(keys.includes(localStorage.getItem(STORAGE_KEY_LATEST_ID)||''))localStorage.removeItem(STORAGE_KEY_LATEST_ID);
  navigator.serviceWorker?.controller?.postMessage({type:'DELETE_TRIP_DATA',tripIds:keys});
}

/** The stored copy of one saved trip (matched by its server id), or null. */
export function getOfflineTripByTripId(serverTripId: string): CachedTripData | null {
  if (!serverTripId) return null;
  return Object.values(getAllOfflineTripsMap()).find(trip => trip?.config?.tripId === serverTripId) ?? null;
}

/** Remove every stored itinerary (used on logout, since saved trips are private to the account). */
export function clearOfflineTrips(): void {
  try {
    const keys = Object.keys(getAllOfflineTripsMap());
    localStorage.removeItem(STORAGE_KEY_TRIPS);
    localStorage.removeItem(STORAGE_KEY_LATEST_ID);
    if (keys.length) navigator.serviceWorker?.controller?.postMessage({ type: "DELETE_TRIP_DATA", tripIds: keys });
  } catch (err) {
    console.warn("Failed to clear stored itineraries:", err);
  }
}
