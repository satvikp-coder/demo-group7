/**
 * Utility to parse arrival time strings and detect scheduling conflicts
 * against an attraction's bestTimeNote recommendation.
 */

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export interface BestTimeConflict {
  hasConflict: boolean;
  warningMessage: string;
}

export function checkBestTimeConflict(
  arrivalTimeStr: string,
  note?: string,
): BestTimeConflict {
  if (!note || !arrivalTimeStr) {
    return { hasConflict: false, warningMessage: "" };
  }

  const arrivalMins = parseTimeToMinutes(arrivalTimeStr);
  const noteLower = note.toLowerCase();

  // 1. Midday avoidance (e.g. "Avoid midday (11am-3pm)", "avoid noon")
  if (
    noteLower.includes("avoid midday") ||
    noteLower.includes("open salt flat heat")
  ) {
    // 11:00 AM (660) to 3:00 PM (900)
    if (arrivalMins >= 660 && arrivalMins < 900) {
      return {
        hasConflict: true,
        warningMessage: `Scheduled at ${arrivalTimeStr} during peak midday heat. Note advises avoiding 11 AM - 3 PM.`,
      };
    }
  }

  // 2. Sunrise / Early morning (e.g. "Best at sunrise", "early morning safari", "mangla aarti")
  if (
    noteLower.includes("sunrise") ||
    noteLower.includes("first light") ||
    noteLower.includes("early morning")
  ) {
    // If scheduled after 11:00 AM (660 mins)
    if (arrivalMins >= 660) {
      return {
        hasConflict: true,
        warningMessage: `Scheduled at ${arrivalTimeStr}. Note recommends early morning / sunrise for the best experience.`,
      };
    }
  }

  // 3. Sunset / Late afternoon / Evening (e.g. "Best at sunset", "late afternoon", "1 hour before sunset")
  if (
    noteLower.includes("sunset") ||
    noteLower.includes("late afternoon") ||
    noteLower.includes("evening aarti")
  ) {
    // If scheduled before 2:00 PM (840 mins)
    if (arrivalMins < 840) {
      return {
        hasConflict: true,
        warningMessage: `Scheduled at ${arrivalTimeStr}. Note recommends late afternoon or sunset.`,
      };
    }
  }

  // 4. Time range e.g. "before 11am" or "before 8:30am"
  if (noteLower.includes("before 11am") && arrivalMins >= 660) {
    return {
      hasConflict: true,
      warningMessage: `Scheduled at ${arrivalTimeStr}. Note recommends visiting before 11:00 AM for optimal light/crowds.`,
    };
  }

  if (noteLower.includes("before 8:30am") && arrivalMins >= 510) {
    return {
      hasConflict: true,
      warningMessage: `Scheduled at ${arrivalTimeStr}. Note recommends before 8:30 AM to avoid long queues.`,
    };
  }

  // 5. Specific slots e.g., "10:15am", "10am-4pm", "4pm-6pm"
  if (
    noteLower.includes("10:15am") &&
    (arrivalMins > 690 || arrivalMins < 570)
  ) {
    return {
      hasConflict: true,
      warningMessage: `Scheduled at ${arrivalTimeStr}. Note indicates pre-booked tour slot at 10:15 AM.`,
    };
  }

  if (
    noteLower.includes("4pm-6pm") &&
    (arrivalMins < 930 || arrivalMins > 1110)
  ) {
    return {
      hasConflict: true,
      warningMessage: `Scheduled at ${arrivalTimeStr}. Note recommends 4 PM - 6 PM for cooler temperatures.`,
    };
  }

  return { hasConflict: false, warningMessage: "" };
}
