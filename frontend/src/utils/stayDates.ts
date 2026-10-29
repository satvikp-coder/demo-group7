// Keeps the planner's lodging nights and arrival/departure dates consistent.
// dsa/planning/accommodation.ts stays the authority; these helpers only prepare values that satisfy it.
import { accommodationNights, calendarDay } from "../../../dsa/planning/accommodation";

/** Nights between two valid dates, or null if either is missing/invalid or departure precedes arrival. */
export function nightsBetween(arrival: string, departure: string): number | null {
  const start = calendarDay(arrival);
  const end = calendarDay(departure);
  return start === null || end === null || end < start ? null : end - start;
}

/** The calendar date `nights` after `arrival`, or null if the arrival is not a valid date. */
export function addNights(arrival: string, nights: number): string | null {
  const start = calendarDay(arrival);
  if (start === null || !Number.isInteger(nights) || nights < 0) return null;
  return new Date((start + nights) * 86400000).toISOString().slice(0, 10);
}

/** Empty string when the stay is consistent; otherwise the reason it cannot be planned. */
export function stayDateIssue(input: { days: number; nights: number; arrival: string; departure: string }): string {
  try {
    accommodationNights({ days: input.days, lodging_nights: input.nights, arrival_date: input.arrival, departure_date: input.departure });
    return "";
  } catch (error) {
    return error instanceof Error ? error.message : "The accommodation dates are not valid.";
  }
}
