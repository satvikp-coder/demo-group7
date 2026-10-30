// Map-leg helpers kept free of Leaflet so they can be tested directly.
export type LatLng = [number, number];
export interface PointStop { id: string; lat?: number; lng?: number }
export interface LegRef { from_stop_id: string; to_stop_id: string; coordinates: unknown[] }

/** [lat, lng] for a stop with a valid location, or null (also for a missing stop). */
export function stopPoint(stop?: PointStop | null): LatLng | null {
  if (!stop) return null;
  const { lat, lng } = stop;
  return typeof lat === "number" && Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    typeof lng === "number" && Number.isFinite(lng) && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

/** Legs that can be drawn: they have geometry and both end stops exist with valid locations. Others are skipped. */
export function drawableLegs<L extends LegRef>(legs: L[], stops: PointStop[]): L[] {
  return legs.filter(leg =>
    leg.coordinates.length >= 2 &&
    stopPoint(stops.find(s => s.id === leg.from_stop_id)) !== null &&
    stopPoint(stops.find(s => s.id === leg.to_stop_id)) !== null);
}
