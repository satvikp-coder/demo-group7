export function getMaxAttractionsPerDay(
  totalAttractionsCount: number,
  numDays: number,
  strategy: string
): number {
  return Math.min(
    4,
    Math.ceil(totalAttractionsCount / numDays) + (strategy === "rating-first" ? 0 : 1)
  );
}

export function isLunchTime(currentClock: number, lunchInserted: boolean): boolean {
  return !lunchInserted && currentClock >= 720;
}

export function isDinnerTime(currentClock: number): boolean {
  return currentClock >= 1110;
}
