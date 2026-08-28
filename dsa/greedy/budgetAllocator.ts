export interface SimpleHotel {
  id: string;
  name: string;
  priceNumeric: number;
  ratingNumeric: number;
  lat: number;
  lng: number;
}

export interface SimpleAttraction {
  id: string;
  name: string;
  entryFeeNumeric: number;
  rating: number;
  lat: number;
  lng: number;
  durationHours: number;
  category: string;
  wheelchairAccessible: boolean;
  physicalDemand: "low" | "moderate" | "high";
  bestTimeNote?: string;
}

export function selectStartingHotel<H extends SimpleHotel>(
  hotels: H[],
  totalBudgetCap: number,
  numDays: number,
  strategy: string,
  preferredHotelId?: string,
  isExplicitPinnedHotel: boolean = false
): H {
  if (hotels.length === 0) {
    throw new Error("No hotels available in the destination.");
  }

  // If user explicitly pinned a preferred hotel and it fits within total budget, respect choice
  if (isExplicitPinnedHotel && preferredHotelId) {
    const preferred = hotels.find((h) => h.id === preferredHotelId);
    if (preferred && preferred.priceNumeric * numDays <= totalBudgetCap * 0.9) {
      return preferred;
    }
  }

  const dailyBudget = totalBudgetCap / Math.max(1, numDays);

  if (strategy === "budget-first" || dailyBudget <= 3000) {
    // Economy Tier: select most economical hotel to conserve budget for attractions/meals
    const sortedByPrice = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric);
    return sortedByPrice[0];
  } else if (dailyBudget > 7500) {
    // Luxury Tier: select premier/highest-rated luxury resort or palace
    const sortedByRating = [...hotels].sort((a, b) => b.ratingNumeric - a.ratingNumeric || b.priceNumeric - a.priceNumeric);
    const chosenLuxury = sortedByRating.find((h) => h.priceNumeric * numDays <= totalBudgetCap * 0.75);
    return chosenLuxury || sortedByRating[0];
  } else {
    // Moderate / Balanced Tier (₹3,000 - ₹7,500/day):
    // Select the best-rated hotel whose price fits comfortably within 50-65% of daily budget
    const affordableHotels = hotels.filter((h) => h.priceNumeric * numDays <= totalBudgetCap * 0.65);
    if (affordableHotels.length > 0) {
      affordableHotels.sort((a, b) => b.ratingNumeric - a.ratingNumeric);
      return affordableHotels[0];
    }
    const sortedByPrice = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric);
    return sortedByPrice[0];
  }
}


export function filterAttractionsByBudget<A extends SimpleAttraction>(
  attractions: A[],
  remainingBudget: number,
  visitedIds: { has(key: string): boolean }
): A[] {
  return attractions.filter(
    a => !visitedIds.has(a.id) && (a.entryFeeNumeric || 0) <= remainingBudget
  );
}
