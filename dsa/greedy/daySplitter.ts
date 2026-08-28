export function getMaxAttractionsPerDay(
  remainingAttractionsCount: number,
  remainingDays: number,
  strategy?: string
): number {
  if (remainingDays <= 0) return Math.max(1, remainingAttractionsCount);
  // Dynamically allocate remaining unvisited attractions across remaining days
  const perDay = Math.ceil(remainingAttractionsCount / remainingDays);
  return Math.min(4, Math.max(1, perDay));
}

export function isLunchTime(currentClock: number, lunchInserted: boolean): boolean {
  return !lunchInserted && currentClock >= 720;
}

export function isDinnerTime(currentClock: number): boolean {
  return currentClock >= 1110;
}

