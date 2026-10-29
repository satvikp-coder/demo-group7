// Distances shown on the route map must come from the same saved route records as the day total
// (generation_summary.legs, carried on each stop as legDistanceKm = the leg from that stop to the next).
export interface StopWithLeg { id: string; legDistanceKm?: number | null }

/** Saved distance of the leg that starts at `fromStopId`, or null when no saved record exists. */
export function savedLegKm(stops: StopWithLeg[], fromStopId: string): number | null {
  const km = stops.find(s => s.id === fromStopId)?.legDistanceKm;
  return typeof km === "number" && Number.isFinite(km) ? km : null;
}

/** Sum of the saved leg distances for the day, or null if any leg (all but the last stop) has none. */
export function savedDayKm(stops: StopWithLeg[]): number | null {
  let total = 0;
  for (const stop of stops.slice(0, -1)) {
    const km = savedLegKm(stops, stop.id);
    if (km === null) return null;
    total += km;
  }
  return Math.round(total * 100) / 100;
}
