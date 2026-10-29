/** "12ms" for a recorded time, or null when the timing is absent (saved trips do not store one). */
export function executionTimeLabel(ms: unknown): string | null {
  return typeof ms === "number" && Number.isFinite(ms) && ms >= 0 ? `${ms.toLocaleString("en-IN")}ms` : null;
}
