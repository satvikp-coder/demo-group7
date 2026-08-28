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
  preferredHotelId?: string
): H {
  if (hotels.length === 0) {
    throw new Error("No hotels available in the destination.");
  }

  const preferred = preferredHotelId ? hotels.find(h => h.id === preferredHotelId) : undefined;

  if (strategy === "budget-first") {
    // Budget-first strictly chooses the lowest priced hotel base
    const sortedByPrice = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric);
    return sortedByPrice[0];
  } else if (strategy === "rating-first") {
    // Rating-first chooses the highest-rated hotel that fits within budget
    const sortedByRating = [...hotels].sort((a, b) => b.ratingNumeric - a.ratingNumeric);
    const affordable = sortedByRating.find(h => (h.priceNumeric * numDays) <= totalBudgetCap * 0.75);
    return affordable || sortedByRating[0] || hotels[0];
  } else {
    // Distance-first / default: if preferred hotel is provided and affordable, use it; otherwise choose central affordable hotel
    if (preferred && (preferred.priceNumeric * numDays) <= totalBudgetCap) {
      return preferred;
    }
    const affordable = hotels.filter(h => (h.priceNumeric * numDays) <= totalBudgetCap);
    return affordable[0] || hotels[0];
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
