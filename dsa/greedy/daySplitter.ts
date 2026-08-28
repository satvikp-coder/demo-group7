/**
 * Computes maximum allowed attractions for a given day in a multi-day itinerary.
 * Distributes attractions smoothly across remaining days to prevent early pool exhaustion.
 */
export function getMaxAttractionsPerDay(
  remainingAttractionsCount: number,
  remainingDays: number,
  strategy: string
): number {
  if (remainingDays <= 1) {
    return Math.max(1, Math.min(4, remainingAttractionsCount));
  }
  
  // Calculate balanced daily quota based on unvisited attractions and remaining days
  const balancedQuota = Math.ceil(remainingAttractionsCount / remainingDays);
  
  // Rating-first focuses on deep quality (1-2 per day), while budget & distance balance across available daylight
  if (strategy === "rating-first") {
    return Math.max(1, Math.min(3, balancedQuota));
  }
  
  return Math.max(1, Math.min(3, balancedQuota));
}

export function isLunchTime(currentClock: number, lunchInserted: boolean): boolean {
  return !lunchInserted && currentClock >= 720;
}

export function isDinnerTime(currentClock: number): boolean {
  return currentClock >= 1110;
}
