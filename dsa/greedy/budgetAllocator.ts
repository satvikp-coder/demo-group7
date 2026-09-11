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

export interface HotelSelectionResult<H extends SimpleHotel> {
  hotel: H;
  isReplaced: boolean;
  replacementReason?: string;
}

export function selectStartingHotelWithInfo<H extends SimpleHotel>(
  hotels: H[],
  totalBudgetCap: number,
  numDays: number,
  strategy: string,
  preferredHotelId?: string
): HotelSelectionResult<H> {
  if (hotels.length === 0) {
    throw new Error("No hotels available in the destination.");
  }

  const preferred = preferredHotelId ? hotels.find(h => h.id === preferredHotelId) : undefined;

  // If user explicitly selected a hotel:
  if (preferred) {
    const totalHotelCost = preferred.priceNumeric * numDays;
    // Check if preferred hotel is compatible with the total budget cap
    if (totalHotelCost <= totalBudgetCap) {
      // Compatible with budget: HONOR the user's selected hotel across all strategies
      return {
        hotel: preferred,
        isReplaced: false,
      };
    } else {
      // Exceeds total budget constraint: find best affordable alternative
      const affordable = hotels.filter(h => (h.priceNumeric * numDays) <= totalBudgetCap);
      let fallback: H;
      if (affordable.length > 0) {
        if (strategy === "rating-first") {
          fallback = [...affordable].sort((a, b) => b.ratingNumeric - a.ratingNumeric)[0];
        } else {
          fallback = [...affordable].sort((a, b) => a.priceNumeric - b.priceNumeric)[0];
        }
      } else {
        // If even the cheapest exceeds total budget, select the most economical property
        fallback = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric)[0];
      }

      return {
        hotel: fallback,
        isReplaced: true,
        replacementReason: `Selected hotel "${preferred.name}" (₹${totalHotelCost.toLocaleString("en-IN")} for ${numDays} night${numDays > 1 ? "s" : ""}) exceeds your total trip budget of ₹${totalBudgetCap.toLocaleString("en-IN")}. Replaced with "${fallback.name}" (₹${(fallback.priceNumeric * numDays).toLocaleString("en-IN")}) to maintain budget feasibility.`,
      };
    }
  }

  // No specific hotel chosen: choose based on strategy
  if (strategy === "budget-first") {
    const sortedByPrice = [...hotels].sort((a, b) => a.priceNumeric - b.priceNumeric);
    return { hotel: sortedByPrice[0], isReplaced: false };
  } else if (strategy === "rating-first") {
    const sortedByRating = [...hotels].sort((a, b) => b.ratingNumeric - a.ratingNumeric);
    const affordable = sortedByRating.find(h => (h.priceNumeric * numDays) <= totalBudgetCap * 0.75);
    return { hotel: affordable || sortedByRating[0] || hotels[0], isReplaced: false };
  } else {
    const affordable = hotels.filter(h => (h.priceNumeric * numDays) <= totalBudgetCap);
    return { hotel: affordable[0] || hotels[0], isReplaced: false };
  }
}

export function selectStartingHotel<H extends SimpleHotel>(
  hotels: H[],
  totalBudgetCap: number,
  numDays: number,
  strategy: string,
  preferredHotelId?: string
): H {
  return selectStartingHotelWithInfo(hotels, totalBudgetCap, numDays, strategy, preferredHotelId).hotel;
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
