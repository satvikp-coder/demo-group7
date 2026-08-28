import { SimpleAttraction } from "./budgetAllocator";

/**
 * Single Parameterized Scoring Function for Greedy Selection across strategies:
 * - budget-first: Strongly prioritizes low entry fees and short travel distance to minimize transport costs
 * - rating-first: Strongly prioritizes highest-rated cultural landmarks (>= 4.6★) while staying within budget
 * - distance-first: Strictly prioritizes spatial proximity (nearest neighbor) to minimize travel distance
 */
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

  // If attraction fee exceeds remaining budget, penalize heavily
  if (fee > remainingBudget && remainingBudget > 0) {
    return -99999;
  }

  switch (strategy) {
    case "budget-first":
      // Heavily penalize entry fee; moderately penalize distance to keep fuel/transit low
      return -fee * 25 - dist * 4 + rating * 1.5;

    case "rating-first":
      // Heavily reward 4.7★ - 5.0★ quality; slightly penalize distance and fee
      return rating * 100 - fee * 0.4 - dist * 1.2;

    case "distance-first":
    default:
      // Strictly penalize distance to choose the nearest unvisited neighbor
      return -dist * 100 + rating * 0.8 - fee * 0.05;
  }
}
