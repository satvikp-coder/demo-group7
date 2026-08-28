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
      // Prioritizes lowest entry fee, with value-for-money rating bonus
      return -fee * 20 + rating * 5 - dist * 0.1;

    case "rating-first":
      // Strictly prioritizes highest ratings (e.g. 4.9 > 4.8 > 4.5)
      return rating * 100 - fee * 0.1 - dist * 0.5;

    case "distance-first":
    default:
      // Strictly prioritizes nearest-neighbor distance minimization
      return -dist * 100 + rating * 2 - fee * 0.05;
  }
}

