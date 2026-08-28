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

  // If user explicitly chose a preferred hotel, keep all strategies on the same baseline hotel
  if (preferredHotelId) {
    const preferred = hotels.find((h) => h.id === preferredHotelId);
    if (preferred) return preferred;
  }

  if (strategy === "budget-first") {
    const sortedByPrice = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric);
    return sortedByPrice[0];
  } else if (strategy === "rating-first") {
    const sortedByRating = [...hotels].sort((a, b) => b.ratingNumeric - a.ratingNumeric);
    const chosen = sortedByRating.find((h) => h.priceNumeric * numDays <= totalBudgetCap);
    return chosen || sortedByRating[0];
  } else {
    // Distance-first: balanced default hotel
    const sortedByPrice = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric);
    const chosen = sortedByPrice.find((h) => h.priceNumeric * numDays <= totalBudgetCap);
    return chosen || hotels[0];
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
