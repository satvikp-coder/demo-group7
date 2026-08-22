import {
  Destination,
  Attraction,
  Hotel,
  Restaurant,
  getCityById,
  GUJARAT_DESTINATIONS,
} from "../data/destinations";

export type OptimizationStrategy =
  "budget-first" | "rating-first" | "distance-first";

export interface PlannerConfigPayload {
  cityId: string;
  tripDays: number;
  budget: number;
  startingHotelId: string;
  startTime: string;
  strategy?: OptimizationStrategy;
  wheelchairAccessibleOnly?: boolean;
}

export interface ItineraryStop {
  id: string;
  type: "hotel" | "attraction" | "meal";
  name: string;
  category: string;
  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;
  cost: number;
  location: string;
  imageUrl?: string;
  description?: string;
  lat?: number;
  lng?: number;
  wheelchairAccessible?: boolean;
  physicalDemand?: "low" | "moderate" | "high";
  bestTimeNote?: string;
}

export interface DayRoute {
  dayNumber: number;
  dateLabel: string;
  title: string;
  stops: ItineraryStop[];
  totalKm: number;
  totalCost: number;
}

export interface AlgorithmStats {
  attractionsConsidered: number;
  attractionsVisited: number;
  directRoadConnectionsUsed: number;
  dijkstraFallbackCalls: number;
  nodesVisited: number;
  edgesRelaxed: number;
  executionTimeMs: number;
}

export interface GeneratedItineraryResult {
  strategy: OptimizationStrategy;
  strategyName: string;
  strategyTagline: string;
  activeCity: Destination;
  startingHotel: Hotel;
  dayPlans: DayRoute[];
  totalCost: number;
  totalDistanceKm: number;
  attractionCount: number;
  totalRuntimeMinutes: number;
  totalRuntimeHours: string;
  stats: AlgorithmStats;
}

export function formatTime(minutesFromMidnight: number): string {
  const mins = Math.floor(minutesFromMidnight) % (24 * 60);
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = m < 10 ? `0${m}` : m;
  return `${displayHours}:${displayMins} ${ampm}`;
}

export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 8 * 60;
  const parts = timeStr.trim().split(" ");
  if (parts.length < 2) return 8 * 60;
  const [hStr, mStr] = parts[0].split(":");
  let hours = parseInt(hStr, 10) || 8;
  const mins = parseInt(mStr, 10) || 0;
  const ampm = parts[1].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export function getDistanceKm(
  lat1?: number,
  lng1?: number,
  lat2?: number,
  lng2?: number,
): number {
  if (
    lat1 === undefined ||
    lng1 === undefined ||
    lat2 === undefined ||
    lng2 === undefined
  ) {
    return 3.5;
  }
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  const roadDist = dist < 0.5 ? 1.2 : dist * 1.35;
  return Math.round(roadDist * 10) / 10;
}

/**
 * Single Parameterized Scoring Function for Greedy Selection
 */
function scoreAttraction(
  attraction: Attraction,
  currentLocation: { lat: number; lng: number },
  remainingBudget: number,
  strategy: OptimizationStrategy,
): number {
  const fee = attraction.entryFeeNumeric || 0;
  const rating = attraction.rating || 4.5;
  const dist = getDistanceKm(
    currentLocation.lat,
    currentLocation.lng,
    attraction.lat,
    attraction.lng,
  );

  // If attraction fee exceeds remaining budget, give severe penalty
  if (fee > remainingBudget && remainingBudget > 0) {
    return -99999;
  }

  switch (strategy) {
    case "budget-first":
      // Minimize cost primarily, higher rating as tie-breaker, minimal distance impact
      return -fee * 10 + rating * 8 - dist * 0.2;

    case "rating-first":
      // Maximize rating primarily, low cost impact, moderate distance penalty
      return rating * 100 - fee * 0.15 - dist * 0.8;

    case "distance-first":
    default:
      // Minimize travel distance primarily (nearest neighbor), rating & cost secondary
      return -dist * 50 + rating * 6 - fee * 0.05;
  }
}

/**
 * Evaluates route legs and counts direct road connections vs. Dijkstra fallback calls
 */
function evaluateRouteLeg(
  from: { lat?: number; lng?: number },
  to: { lat?: number; lng?: number },
  cityNodes: { lat?: number; lng?: number }[],
): {
  distanceKm: number;
  isDirect: boolean;
  nodesVisited: number;
  edgesRelaxed: number;
} {
  const directDist = getDistanceKm(from.lat, from.lng, to.lat, to.lng);

  if (directDist <= 2.2) {
    return {
      distanceKm: directDist,
      isDirect: true,
      nodesVisited: 0,
      edgesRelaxed: 0,
    };
  }

  const N = cityNodes.length;
  if (N <= 1) {
    return {
      distanceKm: directDist,
      isDirect: false,
      nodesVisited: Math.max(1, N),
      edgesRelaxed: Math.max(1, N),
    };
  }

  let startIdx = 0;
  let minStartDist = Infinity;
  let targetIdx = N - 1;
  let minTargetDist = Infinity;

  for (let i = 0; i < N; i++) {
    const dFrom = getDistanceKm(
      from.lat,
      from.lng,
      cityNodes[i].lat,
      cityNodes[i].lng,
    );
    if (dFrom < minStartDist) {
      minStartDist = dFrom;
      startIdx = i;
    }
    const dTo = getDistanceKm(
      to.lat,
      to.lng,
      cityNodes[i].lat,
      cityNodes[i].lng,
    );
    if (dTo < minTargetDist) {
      minTargetDist = dTo;
      targetIdx = i;
    }
  }

  const dists = new Array(N).fill(Infinity);
  const visited = new Set<number>();
  dists[startIdx] = 0;

  let nodesVisited = 0;
  let edgesRelaxed = 0;

  while (visited.size < N) {
    let u = -1;
    let minD = Infinity;
    for (let i = 0; i < N; i++) {
      if (!visited.has(i) && dists[i] < minD) {
        minD = dists[i];
        u = i;
      }
    }

    if (u === -1 || minD === Infinity) break;

    visited.add(u);
    nodesVisited++;

    if (u === targetIdx) break;

    for (let v = 0; v < N; v++) {
      if (u === v) continue;
      const dUV = getDistanceKm(
        cityNodes[u].lat,
        cityNodes[u].lng,
        cityNodes[v].lat,
        cityNodes[v].lng,
      );
      const hasEdge = dUV <= 2.5 || Math.abs(u - v) === 1;
      if (hasEdge) {
        edgesRelaxed++;
        if (dists[u] + dUV < dists[v]) {
          dists[v] = dists[u] + dUV;
        }
      }
    }
  }

  const pathDist =
    dists[targetIdx] !== Infinity
      ? Math.round(dists[targetIdx] * 10) / 10
      : directDist;

  return {
    distanceKm: pathDist > 0 ? pathDist : directDist,
    isDirect: false,
    nodesVisited,
    edgesRelaxed,
  };
}

/**
 * Single Parameterized Itinerary Builder Engine
 */
export function generateStrategyItinerary(
  config: PlannerConfigPayload,
  strategy: OptimizationStrategy,
  language: string = "en",
): GeneratedItineraryResult {
  const startTimeMs = performance.now();

  const activeCity = getCityById(config.cityId) || GUJARAT_DESTINATIONS[0];
  const numDays = Math.max(1, config.tripDays || 2);
  const startMinsBase = parseTimeToMinutes(config.startTime);
  const totalBudgetCap = config.budget || 8500;

  const cityNodes = [
    ...activeCity.hotels,
    ...activeCity.attractions,
    ...activeCity.restaurants,
  ];

  let directRoadConnectionsUsed = 0;
  let dijkstraFallbackCalls = 0;
  let totalNodesVisited = 0;
  let totalEdgesRelaxed = 0;

  // Strategy metadata
  let strategyName = "Distance-first";
  let strategyTagline = "Nearest-neighbor distance minimization";
  if (strategy === "budget-first") {
    strategyName = "Budget-first";
    strategyTagline = "Greedy cost & fee minimization";
  } else if (strategy === "rating-first") {
    strategyName = "Rating-first";
    strategyTagline = "Highest-rated cultural landmarks";
  }

  // 1. Hotel Selection according to strategy
  let startingHotel: Hotel;
  if (strategy === "budget-first") {
    // Pick the most economical hotel fitting the city
    const sortedByPrice = [...activeCity.hotels].sort(
      (a, b) => a.priceNumeric - b.priceNumeric,
    );
    startingHotel = sortedByPrice[0] || activeCity.hotels[0];
  } else if (strategy === "rating-first") {
    // Pick the highest-rated hotel
    const sortedByRating = [...activeCity.hotels].sort(
      (a, b) => b.ratingNumeric - a.ratingNumeric,
    );
    startingHotel = sortedByRating[0] || activeCity.hotels[0];
  } else {
    // Distance-first / user preference
    startingHotel =
      activeCity.hotels.find((h) => h.id === config.startingHotelId) ||
      activeCity.hotels[0];
  }

  const hotelTotalCost = startingHotel.priceNumeric * numDays;
  let remainingBudget = totalBudgetCap - hotelTotalCost;

  let attractionsPool = [...(activeCity.attractions || [])];
  if (config.wheelchairAccessibleOnly) {
    attractionsPool = attractionsPool.filter(
      (a) => a.wheelchairAccessible === true,
    );
  }
  const restaurantsPool = activeCity.restaurants || [];
  const visitedAttractionIds = new Set<string>();

  const dayPlans: DayRoute[] = [];
  let grandTotalDistanceKm = 0;
  let grandTotalCost = hotelTotalCost;
  let totalAttractionsVisited = 0;
  let totalRuntimeMinutesAcc = 0;

  const datesList = [
    "DAY 1",
    "DAY 2",
    "DAY 3",
    "DAY 4",
    "DAY 5",
    "DAY 6",
    "DAY 7",
  ];

  for (let d = 0; d < numDays; d++) {
    const stops: ItineraryStop[] = [];
    let currentClock = startMinsBase;
    let dayKm = 0;
    let dayCost = 0;
    let currentPos = { lat: startingHotel.lat, lng: startingHotel.lng };

    // Depart Hotel
    const hotelDepartMins = currentClock;
    stops.push({
      id: `${startingHotel.id}-start-day-${d + 1}`,
      type: "hotel",
      name:
        language === "gu"
          ? `રવાના: ${startingHotel.name}`
          : language === "hi"
            ? `रवाना: ${startingHotel.name}`
            : `Depart ${startingHotel.name}`,
      category: "Starting Accommodation",
      arrivalTime: formatTime(hotelDepartMins),
      departureTime: formatTime(hotelDepartMins + 15),
      durationMinutes: 15,
      cost: startingHotel.priceNumeric,
      location: startingHotel.location,
      imageUrl: startingHotel.imageUrl,
      description: `Morning departure from hotel base.`,
      lat: startingHotel.lat,
      lng: startingHotel.lng,
    });

    currentClock += 15;
    totalRuntimeMinutesAcc += 15;

    let lunchInserted = false;
    let dayAttractionCount = 0;

    // Max attractions per day depends on strategy & duration
    const maxAttractionsPerDay = Math.min(
      4,
      Math.ceil(attractionsPool.length / numDays) +
        (strategy === "rating-first" ? 0 : 1),
    );

    while (currentClock < 1140 && dayAttractionCount < maxAttractionsPerDay) {
      // until 7:00 PM
      // Lunch insertion window
      if (!lunchInserted && currentClock >= 720 && restaurantsPool.length > 0) {
        const restoIndex = d % restaurantsPool.length;
        const resto = restaurantsPool[restoIndex];

        const routeEval = evaluateRouteLeg(currentPos, resto, cityNodes);
        if (routeEval.isDirect) directRoadConnectionsUsed++;
        else {
          dijkstraFallbackCalls++;
          totalNodesVisited += routeEval.nodesVisited;
          totalEdgesRelaxed += routeEval.edgesRelaxed;
        }

        const distToResto = routeEval.distanceKm;
        dayKm += distToResto;
        currentPos = { lat: resto.lat, lng: resto.lng };

        const lunchStart = currentClock;
        const lunchEnd = lunchStart + 60;
        stops.push({
          id: `lunch-stop-day-${d + 1}`,
          type: "meal",
          name:
            language === "gu"
              ? `બપોરનું ભોજન: ${resto.name}`
              : language === "hi"
                ? `दोपहर का भोजन: ${resto.name}`
                : `Lunch Break at ${resto.name}`,
          category: "Culinary Stop",
          arrivalTime: formatTime(lunchStart),
          departureTime: formatTime(lunchEnd),
          durationMinutes: 60,
          cost: resto.avgCostPerPerson,
          location: resto.location,
          description: `Authentic ${resto.cuisine || "Gujarati meal"} stop.`,
          lat: resto.lat,
          lng: resto.lng,
        });

        currentClock = lunchEnd + 15;
        dayCost += resto.avgCostPerPerson;
        totalRuntimeMinutesAcc += 75;
        lunchInserted = true;
      }

      // Find best remaining candidate using parameterized scoreAttraction
      const unvisited = attractionsPool.filter(
        (a) => !visitedAttractionIds.has(a.id),
      );
      if (unvisited.length === 0) break;

      unvisited.sort((a, b) => {
        const scoreA = scoreAttraction(
          a,
          currentPos,
          remainingBudget,
          strategy,
        );
        const scoreB = scoreAttraction(
          b,
          currentPos,
          remainingBudget,
          strategy,
        );
        return scoreB - scoreA;
      });

      const chosen = unvisited[0];
      visitedAttractionIds.add(chosen.id);

      const routeEval = evaluateRouteLeg(currentPos, chosen, cityNodes);
      if (routeEval.isDirect) directRoadConnectionsUsed++;
      else {
        dijkstraFallbackCalls++;
        totalNodesVisited += routeEval.nodesVisited;
        totalEdgesRelaxed += routeEval.edgesRelaxed;
      }

      const distToChosen = routeEval.distanceKm;
      const travelMins = Math.max(10, Math.round(distToChosen * 2.2));

      dayKm += distToChosen;
      currentClock += travelMins;
      currentPos = { lat: chosen.lat, lng: chosen.lng };

      const attrStart = currentClock;
      const durationMins = Math.round((chosen.durationHours || 1.5) * 60);
      const attrEnd = attrStart + durationMins;

      const fee = chosen.entryFeeNumeric || 0;
      dayCost += fee;
      remainingBudget -= fee;

      stops.push({
        id: `${chosen.id}-day-${d + 1}`,
        type: "attraction",
        name: chosen.name,
        category: chosen.category,
        arrivalTime: formatTime(attrStart),
        departureTime: formatTime(attrEnd),
        durationMinutes: durationMins,
        cost: fee,
        location: activeCity.name,
        imageUrl: chosen.imageUrl,
        description: chosen.description,
        lat: chosen.lat,
        lng: chosen.lng,
        wheelchairAccessible: chosen.wheelchairAccessible,
        physicalDemand: chosen.physicalDemand,
        bestTimeNote: chosen.bestTimeNote,
      });

      currentClock = attrEnd + 15;
      totalRuntimeMinutesAcc += travelMins + durationMins + 15;
      dayAttractionCount++;
      totalAttractionsVisited++;
    }

    // Dinner insertion if late afternoon
    if (currentClock >= 1110 && restaurantsPool.length > 0) {
      const resto = restaurantsPool[restaurantsPool.length - 1];
      const routeEval = evaluateRouteLeg(currentPos, resto, cityNodes);
      if (routeEval.isDirect) directRoadConnectionsUsed++;
      else {
        dijkstraFallbackCalls++;
        totalNodesVisited += routeEval.nodesVisited;
        totalEdgesRelaxed += routeEval.edgesRelaxed;
      }

      const distToDinner = routeEval.distanceKm;
      dayKm += distToDinner;
      currentPos = { lat: resto.lat, lng: resto.lng };

      const dinnerStart = currentClock;
      const dinnerEnd = dinnerStart + 60;
      stops.push({
        id: `dinner-stop-day-${d + 1}`,
        type: "meal",
        name:
          language === "gu"
            ? `સાંજનું ભોજન: ${resto.name}`
            : language === "hi"
              ? `रात्रि का भोजन: ${resto.name}`
              : `Dinner Stop at ${resto.name}`,
        category: "Evening Dining",
        arrivalTime: formatTime(dinnerStart),
        departureTime: formatTime(dinnerEnd),
        durationMinutes: 60,
        cost: resto.avgCostPerPerson,
        location: resto.location,
        description: `Evening thali & local dinner stop.`,
        lat: resto.lat,
        lng: resto.lng,
      });

      currentClock = dinnerEnd + 15;
      dayCost += resto.avgCostPerPerson;
      totalRuntimeMinutesAcc += 75;
    }

    // Return to Hotel
    const returnEval = evaluateRouteLeg(currentPos, startingHotel, cityNodes);
    if (returnEval.isDirect) directRoadConnectionsUsed++;
    else {
      dijkstraFallbackCalls++;
      totalNodesVisited += returnEval.nodesVisited;
      totalEdgesRelaxed += returnEval.edgesRelaxed;
    }

    const returnDist = returnEval.distanceKm;
    dayKm += returnDist;
    const returnStart = currentClock;

    stops.push({
      id: `${startingHotel.id}-return-day-${d + 1}`,
      type: "hotel",
      name:
        language === "gu"
          ? `પાછા ફરો: ${startingHotel.name}`
          : language === "hi"
            ? `વાપસી: ${startingHotel.name}`
            : `Return to ${startingHotel.name}`,
      category: "Night Stay Loop Complete",
      arrivalTime: formatTime(returnStart),
      departureTime: formatTime(returnStart + 15),
      durationMinutes: 15,
      cost: 0,
      location: startingHotel.location,
      imageUrl: startingHotel.imageUrl,
      description: `Return to hotel completing the day's circular loop.`,
      lat: startingHotel.lat,
      lng: startingHotel.lng,
    });

    totalRuntimeMinutesAcc += 15;

    dayPlans.push({
      dayNumber: d + 1,
      dateLabel: datesList[d % datesList.length],
      title: `Day ${d + 1}: ${strategyName} ${activeCity.name} Circuit`,
      stops,
      totalKm: Math.round(dayKm * 10) / 10,
      totalCost: dayCost,
    });

    grandTotalDistanceKm += dayKm;
    grandTotalCost += dayCost;
  }

  const hoursFloat = Math.round((totalRuntimeMinutesAcc / 60) * 10) / 10;
  const totalRuntimeHours = `${hoursFloat} hrs`;

  const endTimeMs = performance.now();
  const executionTimeMs = Math.max(
    0.1,
    Math.round((endTimeMs - startTimeMs) * 100) / 100,
  );

  return {
    strategy,
    strategyName,
    strategyTagline,
    activeCity,
    startingHotel,
    dayPlans,
    totalCost: Math.round(grandTotalCost),
    totalDistanceKm: Math.round(grandTotalDistanceKm * 10) / 10,
    attractionCount: totalAttractionsVisited,
    totalRuntimeMinutes: totalRuntimeMinutesAcc,
    totalRuntimeHours,
    stats: {
      attractionsConsidered: attractionsPool.length,
      attractionsVisited: totalAttractionsVisited,
      directRoadConnectionsUsed,
      dijkstraFallbackCalls,
      nodesVisited: totalNodesVisited,
      edgesRelaxed: totalEdgesRelaxed,
      executionTimeMs,
    },
  };
}

/**
 * Computes dynamic one-line takeaway from real differences between strategy results
 */
export function generateComparisonTakeaway(
  results: GeneratedItineraryResult[],
): string {
  const bRes = results.find((r) => r.strategy === "budget-first");
  const rRes = results.find((r) => r.strategy === "rating-first");
  const dRes = results.find((r) => r.strategy === "distance-first");

  if (!bRes || !rRes || !dRes) {
    return "Comparison generated across budget, rating, and distance optimization strategies.";
  }

  const costDiff = rRes.totalCost - bRes.totalCost;
  const attrDiff = rRes.attractionCount - bRes.attractionCount;

  // Highest distance strategy minus distance-first strategy
  const maxDist = Math.max(rRes.totalDistanceKm, bRes.totalDistanceKm);
  const distSaved = Math.max(
    0,
    Math.round((maxDist - dRes.totalDistanceKm) * 10) / 10,
  );

  let statement = "";

  if (attrDiff < 0) {
    statement = `Rating-first visits ${Math.abs(attrDiff)} fewer attraction${Math.abs(attrDiff) > 1 ? "s" : ""} but costs ₹${costDiff.toLocaleString("en-IN")} more than Budget-first`;
  } else if (attrDiff > 0) {
    statement = `Rating-first visits ${attrDiff} additional attraction${attrDiff > 1 ? "s" : ""} for ₹${costDiff.toLocaleString("en-IN")} more than Budget-first`;
  } else {
    statement = `Rating-first achieves equal attraction coverage while costing ₹${costDiff.toLocaleString("en-IN")} more than Budget-first`;
  }

  if (distSaved > 0) {
    statement += `, while Distance-first reduces total transit by ${distSaved} km.`;
  } else {
    statement += `, while Distance-first minimizes intra-city transit times.`;
  }

  return statement;
}
