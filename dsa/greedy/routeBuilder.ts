import { SimpleAttraction } from "./budgetAllocator";

export function scoreAttraction(
  attraction: SimpleAttraction,
  currentLocation: { lat: number; lng: number },
  remainingBudget: number,
  strategy: string,
  getDistanceKm: (lat1?: number, lng1?: number, lat2?: number, lng2?: number) => number
): number {
  const fee = attraction.entryFeeNumeric || 0;
  const rating = attraction.rating || 4.5;
  const dist = getDistanceKm(
    currentLocation.lat,
    currentLocation.lng,
    attraction.lat,
    attraction.lng
  );

  // If attraction fee exceeds remaining budget, give severe penalty
  if (fee > remainingBudget && remainingBudget > 0) {
    return -99999;
  }

  switch (strategy) {
    case "budget-first":
      return -fee * 10 + rating * 8 - dist * 0.2;

    case "rating-first":
      return rating * 100 - fee * 0.15 - dist * 0.8;

    case "distance-first":
    default:
      return -dist * 50 + rating * 6 - fee * 0.05;
  }
}
