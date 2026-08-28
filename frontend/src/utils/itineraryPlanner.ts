import {
  Destination,
  Attraction,
  Hotel,
  Restaurant,
  getCityById,
  GUJARAT_DESTINATIONS,
} from "../data/destinations";
import { HashTable } from "@dsa/hashTable/HashTable";
import { mergeSort } from "@dsa/sorting/mergeSort";
import { Graph } from "@dsa/graph/Graph";
import { dijkstra } from "@dsa/dijkstra/dijkstra";
import { selectStartingHotel, filterAttractionsByBudget } from "@dsa/greedy/budgetAllocator";
import { scoreAttraction } from "@dsa/greedy/routeBuilder";
import { getMaxAttractionsPerDay } from "@dsa/greedy/daySplitter";
import { routesCsvText } from "../data/routesCsv";

interface ParsedRoute {
  source_attraction_id: string;
  destination_attraction_id: string;
  distance_km: number;
  travel_time_minutes: number;
}

// Map short codes from routes.csv to frontend slug IDs
const shortIdToSlug: Record<string, string> = {
  // Somnath
  "a101": "somnath-temple",
  "a102": "bhalka-tirth",
  "a103": "triveni-sangam",
  "a104": "somnath-beach",
  "h101": "premier-somnath",
  "h102": "sarovar-portico-somnath",
  "h103": "fern-residency-somnath",
  // Dwarka
  "a201": "dwarkadhish-temple",
  "a202": "nageshwar-jyotirlinga",
  "a203": "rukmini-devi-temple",
  "a204": "bet-dwarka",
  "h201": "darshan-palace",
  "h202": "goverdhan-greens",
  "h203": "mercure-dwarka",
  "h204": "the-dwarika-hotel",
  // Ahmedabad
  "a301": "sabarmati-ashram",
  "a302": "adalaj-stepwell",
  "a303": "sidi-saiyyed-mosque",
  "a304": "calico-museum",
  "a305": "sarkhej-roza",
  "a306": "kankaria-lake",
  "h301": "french-haveli",
  "h302": "lemon-tree-premier",
  "h303": "house-of-mg-ahmedabad"
};

function parseRoutesCsv(csvText: string): ParsedRoute[] {
  const lines = csvText.split("\n");
  const routes: ParsedRoute[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(",");
    if (parts[0] === "source_attraction_id") continue; // Header
    if (parts.length >= 5) {
      routes.push({
        source_attraction_id: parts[0],
        destination_attraction_id: parts[1],
        distance_km: parseFloat(parts[3]),
        travel_time_minutes: parseInt(parts[4], 10),
      });
    }
  }
  return routes;
}

const routesMap = new Map<string, { distanceKm: number; travelTimeMinutes: number }>();
try {
  const parsed = parseRoutesCsv(routesCsvText);
  for (const r of parsed) {
    const srcSlug = shortIdToSlug[r.source_attraction_id] || r.source_attraction_id;
    const destSlug = shortIdToSlug[r.destination_attraction_id] || r.destination_attraction_id;
    const k1 = `${srcSlug}->${destSlug}`;
    const k2 = `${destSlug}->${srcSlug}`;
    routesMap.set(k1, { distanceKm: r.distance_km, travelTimeMinutes: r.travel_time_minutes });
    routesMap.set(k2, { distanceKm: r.distance_km, travelTimeMinutes: r.travel_time_minutes });
  }
} catch (err) {
  console.warn("Failed to parse routes.csv", err);
}

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
  type: "hotel" | "attraction" | "meal" | "transit";
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
  roadKm: number;
  boatKm: number;
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
  roadDistanceKm: number;
  boatDistanceKm: number;
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
  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
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
/**
 * Evaluates route legs and counts direct road connections vs. Dijkstra fallback calls
 */
function evaluateRouteLeg(
  from: { lat?: number; lng?: number; id?: string; transportMode?: string },
  to: { lat?: number; lng?: number; id?: string; transportMode?: string },
  cityNodes: { lat?: number; lng?: number; id?: string; transportMode?: string }[],
): {
  distanceKm: number;
  travelTimeMinutes: number;
  isDirect: boolean;
  nodesVisited: number;
  edgesRelaxed: number;
  isBoat?: boolean;
} {
  const directDist = getDistanceKm(from.lat, from.lng, to.lat, to.lng);

  // Exclude boat-access attractions from road-based graph search
  if (from.transportMode === "boat" || to.transportMode === "boat") {
    return {
      distanceKm: directDist,
      travelTimeMinutes: 0,
      isDirect: true,
      nodesVisited: 0,
      edgesRelaxed: 0,
      isBoat: true,
    };
  }

  // Check if a direct route exists in routes.csv
  const routeKey = from.id && to.id ? `${from.id}->${to.id}` : null;
  const directRoute = routeKey ? routesMap.get(routeKey) : null;

  if (directRoute) {
    return {
      distanceKm: directRoute.distanceKm,
      travelTimeMinutes: directRoute.travelTimeMinutes,
      isDirect: true,
      nodesVisited: 0,
      edgesRelaxed: 0,
    };
  }

  if (directDist <= 2.2) {
    return {
      distanceKm: directDist,
      travelTimeMinutes: Math.max(10, Math.round(directDist * 2.2)),
      isDirect: true,
      nodesVisited: 0,
      edgesRelaxed: 0,
    };
  }

  const filteredCityNodes = cityNodes.filter((n) => n.transportMode !== "boat");
  const N = filteredCityNodes.length;

  if (N <= 1) {
    return {
      distanceKm: directDist,
      travelTimeMinutes: Math.max(10, Math.round(directDist * 2.2)),
      isDirect: false,
      nodesVisited: Math.max(1, N),
      edgesRelaxed: Math.max(1, N),
    };
  }

  // Build the virtual Graph adjacency list
  const graph = new Graph();
  const nodeIds: string[] = [];

  for (let i = 0; i < N; i++) {
    const node = filteredCityNodes[i];
    const id = node.id || `node-${i}`;
    nodeIds.push(id);
    graph.addNode(id, node.lat || 0, node.lng || 0, node.transportMode as any);
  }

  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      if (u === v) continue;
      
      const key = `${nodeIds[u]}->${nodeIds[v]}`;
      const routeInfo = routesMap.get(key);

      if (routeInfo) {
        graph.addEdge(nodeIds[u], nodeIds[v], routeInfo.distanceKm, routeInfo.travelTimeMinutes, "road");
      } else {
        const dUV = getDistanceKm(
          filteredCityNodes[u].lat,
          filteredCityNodes[u].lng,
          filteredCityNodes[v].lat,
          filteredCityNodes[v].lng,
        );
        const hasEdge = dUV <= 2.5 || Math.abs(u - v) === 1;
        if (hasEdge) {
          const travelMins = Math.max(10, Math.round(dUV * 2.2));
          graph.addEdge(nodeIds[u], nodeIds[v], dUV, travelMins, "road");
        }
      }
    }
  }

  // Locate starting and target node IDs
  let startNodeId = nodeIds[0];
  let minStartDist = Infinity;
  let targetNodeId = nodeIds[N - 1];
  let minTargetDist = Infinity;

  for (let i = 0; i < N; i++) {
    const dFrom = getDistanceKm(
      from.lat,
      from.lng,
      filteredCityNodes[i].lat,
      filteredCityNodes[i].lng,
    );
    if (dFrom < minStartDist) {
      minStartDist = dFrom;
      startNodeId = nodeIds[i];
    }
    const dTo = getDistanceKm(
      to.lat,
      to.lng,
      filteredCityNodes[i].lat,
      filteredCityNodes[i].lng,
    );
    if (dTo < minTargetDist) {
      minTargetDist = dTo;
      targetNodeId = nodeIds[i];
    }
  }

  // Execute modular Dijkstra solver using our generic MinHeap
  const result = dijkstra(graph, startNodeId, targetNodeId);

  let pathTime = 0;
  if (result.path.length > 1) {
    for (let i = 0; i < result.path.length - 1; i++) {
      const u = result.path[i];
      const v = result.path[i + 1];
      const edges = graph.getNeighbors(u);
      const edge = edges.find((e) => e.to === v);
      if (edge) {
        pathTime += edge.travelTimeMinutes;
      }
    }
  } else {
    pathTime = Math.max(10, Math.round(result.distanceKm * 2.2));
  }

  return {
    distanceKm: result.distanceKm > 0 ? result.distanceKm : directDist,
    travelTimeMinutes: pathTime,
    isDirect: false,
    nodesVisited: result.nodesVisited,
    edgesRelaxed: result.edgesRelaxed,
  };
}

/**
 * Selects an optimal restaurant based on the chosen strategy
 */
function selectRestaurant(
  restaurants: Restaurant[],
  currentPos: { lat?: number; lng?: number },
  strategy: OptimizationStrategy,
  mealType: "lunch" | "dinner",
  dayIndex: number
): Restaurant {
  if (restaurants.length === 0) {
    return {
      id: "default-dining",
      name: "Heritage Dining Hall",
      lat: currentPos.lat || 23.0225,
      lng: currentPos.lng || 72.5714,
      rating: 4.6,
      avgCostPerPerson: 350,
      location: "City Center",
      cuisine: "Gujarati Thali",
    };
  }

  if (strategy === "budget-first") {
    const sorted = [...restaurants].sort((a, b) => a.avgCostPerPerson - b.avgCostPerPerson);
    return sorted[dayIndex % sorted.length];
  } else if (strategy === "rating-first") {
    const sorted = [...restaurants].sort((a, b) => b.rating - a.rating);
    return sorted[dayIndex % sorted.length];
  } else {
    // Distance-first: select closest restaurant to current location
    const sorted = [...restaurants].sort((a, b) => {
      const distA = getDistanceKm(currentPos.lat, currentPos.lng, a.lat, a.lng);
      const distB = getDistanceKm(currentPos.lat, currentPos.lng, b.lat, b.lng);
      return distA - distB;
    });
    return sorted[0];
  }
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

  // 1. Hotel Selection (respecting user's preferred hotel if provided)
  const startingHotel = selectStartingHotel(
    activeCity.hotels,
    totalBudgetCap,
    numDays,
    strategy,
    config.startingHotelId
  );

  const hotelTotalCost = startingHotel.priceNumeric * numDays;
  let remainingBudget = totalBudgetCap - hotelTotalCost;

  let attractionsPool = [...(activeCity.attractions || [])];
  if (config.wheelchairAccessibleOnly) {
    attractionsPool = attractionsPool.filter(
      (a) => a.wheelchairAccessible === true,
    );
  }
  const restaurantsPool = activeCity.restaurants || [];
  const visitedAttractionIds = new HashTable<string, boolean>();

  const dayPlans: DayRoute[] = [];
  let grandTotalRoadDistanceKm = 0;
  let grandTotalBoatDistanceKm = 0;
  let grandTotalCost = 0;
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
    let dayRoadKm = 0;
    let dayBoatKm = 0;
    let currentPos = { lat: startingHotel.lat, lng: startingHotel.lng, transportMode: undefined as string | undefined };

    // 1. Overnight Stay & Depart Hotel (Stop cost accounts for the night's stay)
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
      category: "Overnight Accommodation Base",
      arrivalTime: formatTime(hotelDepartMins),
      departureTime: formatTime(hotelDepartMins + 15),
      durationMinutes: 15,
      cost: startingHotel.priceNumeric,
      location: startingHotel.location,
      imageUrl: startingHotel.imageUrl,
      description: `Morning departure from accommodation base. (Night stay: ₹${startingHotel.priceNumeric.toLocaleString("en-IN")})`,
      lat: startingHotel.lat,
      lng: startingHotel.lng,
    });

    currentClock += 15;
    totalRuntimeMinutesAcc += 15;

    // 2. Intra-city Local Transit Stop
    stops.push({
      id: `local-transit-day-${d + 1}`,
      type: "transit",
      name:
        language === "gu"
          ? "સ્થાનિક આંતરિક-શહેર પરિવહન"
          : language === "hi"
            ? "स्थानीय इंट्रा-सिटी परिवहन"
            : "Intra-City Local Transit & Fuel",
      category: "Daily Local Transport",
      arrivalTime: formatTime(currentClock),
      departureTime: formatTime(currentClock + 15),
      durationMinutes: 15,
      cost: 350,
      location: activeCity.name,
      description: `Daily intra-city cab, auto-rickshaw & local route transfers across ${activeCity.name}.`,
      lat: startingHotel.lat,
      lng: startingHotel.lng,
    });

    currentClock += 15;
    totalRuntimeMinutesAcc += 15;
    remainingBudget -= 350;

    let lunchInserted = false;
    let dayAttractionCount = 0;

    // Check available remaining unvisited attractions
    const currentUnvisited = filterAttractionsByBudget(attractionsPool, remainingBudget, visitedAttractionIds);
    const remainingDays = numDays - d;
    const maxAttractionsPerDay = getMaxAttractionsPerDay(currentUnvisited.length, remainingDays, strategy);

    if (currentUnvisited.length > 0) {
      // Standard Attraction Circuit
      while (currentClock < 1140 && dayAttractionCount < maxAttractionsPerDay) {
        // Lunch insertion window (~12:00 PM)
        if (!lunchInserted && currentClock >= 720 && restaurantsPool.length > 0) {
          const resto = selectRestaurant(restaurantsPool, currentPos, strategy, "lunch", d);

          const routeEval = evaluateRouteLeg(currentPos, resto, cityNodes);
          if (routeEval.isDirect) directRoadConnectionsUsed++;
          else {
            dijkstraFallbackCalls++;
            totalNodesVisited += routeEval.nodesVisited;
            totalEdgesRelaxed += routeEval.edgesRelaxed;
          }

          const distToResto = routeEval.distanceKm;
          const isLunchBoatTransition = currentPos.transportMode === "boat";

          if (isLunchBoatTransition) {
            const transitStart = currentClock;
            const transitEnd = transitStart + 25;
            stops.push({
              id: `boat-transit-lunch-day-${d + 1}`,
              type: "transit",
              name: "Bet Dwarka to Okha Jetty Ferry",
              category: "Ferry Transit",
              arrivalTime: formatTime(transitStart),
              departureTime: formatTime(transitEnd),
              durationMinutes: 25,
              cost: 30,
              location: "Okha Jetty",
              description: "Ferry return transfer from Bet Dwarka island back to mainland Okha Jetty.",
              lat: 22.4633,
              lng: 69.1114,
            });
            currentClock = transitEnd + 5;
            remainingBudget -= 30;
            dayBoatKm += distToResto;
          } else {
            dayRoadKm += distToResto;
            const travelMins = routeEval.travelTimeMinutes;
            currentClock += travelMins;
          }

          currentPos = { lat: resto.lat, lng: resto.lng, transportMode: undefined };

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
          remainingBudget -= resto.avgCostPerPerson;
          totalRuntimeMinutesAcc += 75;
          lunchInserted = true;
        }

        // Find best remaining candidate
        const unvisited = filterAttractionsByBudget(attractionsPool, remainingBudget, visitedAttractionIds);
        if (unvisited.length === 0) break;

        const sortedCandidates = mergeSort(unvisited, (a, b) => {
          const scoreA = scoreAttraction(
            a,
            currentPos,
            remainingBudget,
            strategy,
            getDistanceKm
          );
          const scoreB = scoreAttraction(
            b,
            currentPos,
            remainingBudget,
            strategy,
            getDistanceKm
          );
          return scoreB - scoreA;
        });

        const chosen = sortedCandidates[0];
        visitedAttractionIds.set(chosen.id, true);

        const routeEval = evaluateRouteLeg(currentPos, chosen, cityNodes);
        if (routeEval.isDirect) directRoadConnectionsUsed++;
        else {
          dijkstraFallbackCalls++;
          totalNodesVisited += routeEval.nodesVisited;
          totalEdgesRelaxed += routeEval.edgesRelaxed;
        }

        const distToChosen = routeEval.distanceKm;
        const isBoatTransition = (currentPos.transportMode === "boat" && chosen.transportMode !== "boat") ||
                                 (currentPos.transportMode !== "boat" && chosen.transportMode === "boat");

        if (isBoatTransition) {
          const transitStart = currentClock;
          const transitEnd = transitStart + 25;
          stops.push({
            id: `boat-transit-${chosen.id}-day-${d + 1}`,
            type: "transit",
            name: currentPos.transportMode === "boat" ? "Bet Dwarka to Okha Jetty Ferry" : "Okha Jetty to Bet Dwarka Ferry",
            category: "Ferry Transit",
            arrivalTime: formatTime(transitStart),
            departureTime: formatTime(transitEnd),
            durationMinutes: 25,
            cost: 30,
            location: "Okha Jetty",
            description: currentPos.transportMode === "boat"
              ? "Ferry return transfer from Bet Dwarka island to mainland Okha Jetty."
              : "Mainland Okha Jetty ferry crossing to Bet Dwarka island (~25 mins).",
            lat: 22.4633,
            lng: 69.1114,
          });
          currentClock = transitEnd + 5;
          remainingBudget -= 30;
          dayBoatKm += distToChosen;
          totalRuntimeMinutesAcc += 30;
        } else {
          dayRoadKm += distToChosen;
          const travelMins = routeEval.travelTimeMinutes;
          currentClock += travelMins;
          totalRuntimeMinutesAcc += travelMins;
        }

        currentPos = { lat: chosen.lat, lng: chosen.lng, transportMode: chosen.transportMode };

        const attrStart = currentClock;
        const durationMins = Math.round((chosen.durationHours || 1.5) * 60);
        const attrEnd = attrStart + durationMins;

        const fee = chosen.entryFeeNumeric || 0;
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
        totalRuntimeMinutesAcc += durationMins + 15;
        dayAttractionCount++;
        totalAttractionsVisited++;
      }
    } else {
      // Meaningful Cultural Craft, Bazaars & Local Heritage Leisure Circuit for later days
      const morningCraftStart = currentClock;
      const morningCraftEnd = morningCraftStart + 105;
      stops.push({
        id: `craft-guild-day-${d + 1}`,
        type: "attraction",
        name:
          language === "gu"
            ? `${activeCity.name} હસ્તકળા અને શિલ્પ કારીગરી પદયાત્રા`
            : language === "hi"
              ? `${activeCity.name} हस्तशिल्प एवं वास्तुकला विरासत वॉक`
              : `${activeCity.name} Heritage Craft & Artisan Guilds Walk`,
        category: "Artisan Craft & Living Heritage",
        arrivalTime: formatTime(morningCraftStart),
        departureTime: formatTime(morningCraftEnd),
        durationMinutes: 105,
        cost: 0,
        location: activeCity.name,
        description: `Explore local master artisans, textile weaving, traditional stone craft ateliers, and living heritage quarters across ${activeCity.name}.`,
        lat: startingHotel.lat + 0.005,
        lng: startingHotel.lng + 0.005,
        wheelchairAccessible: true,
        physicalDemand: "low",
      });
      currentClock = morningCraftEnd + 20;
      dayRoadKm += 3.2;
      totalRuntimeMinutesAcc += 125;

      // Authentic Lunch Stop
      const resto = selectRestaurant(restaurantsPool, currentPos, strategy, "lunch", d);
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
        description: `Authentic regional thali and traditional cuisine stop at ${resto.name}.`,
        lat: resto.lat,
        lng: resto.lng,
      });
      currentClock = lunchEnd + 20;
      remainingBudget -= resto.avgCostPerPerson;
      totalRuntimeMinutesAcc += 80;
      lunchInserted = true;
      dayRoadKm += 2.5;

      // Afternoon Traditional Bazaar & Photography Exploration
      const afternoonWalkStart = currentClock;
      const afternoonWalkEnd = afternoonWalkStart + 120;
      stops.push({
        id: `bazaar-exploration-day-${d + 1}`,
        type: "attraction",
        name:
          language === "gu"
            ? `${activeCity.name} પરંપરાગત બજાર અને સ્મૃતિચિહ્ન શોધ`
            : language === "hi"
              ? `${activeCity.name} पारंपरिक बाजार एवं स्मृति चिन्ह अन्वेषण`
              : `${activeCity.name} Traditional Bazaars & Cultural Exploration`,
        category: "Cultural Bazaars & Photography",
        arrivalTime: formatTime(afternoonWalkStart),
        departureTime: formatTime(afternoonWalkEnd),
        durationMinutes: 120,
        cost: 0,
        location: activeCity.name,
        description: `Leisurely photography walk through historic alleys, spice bazaars, handcrafted brassware, and traditional Gujarati souvenirs.`,
        lat: startingHotel.lat - 0.004,
        lng: startingHotel.lng + 0.003,
        wheelchairAccessible: true,
        physicalDemand: "low",
      });
      currentClock = afternoonWalkEnd + 15;
      dayRoadKm += 2.8;
      totalRuntimeMinutesAcc += 135;
    }

    // Mid-day Lunch if not yet inserted
    if (!lunchInserted && restaurantsPool.length > 0) {
      const resto = selectRestaurant(restaurantsPool, currentPos, strategy, "lunch", d);
      const lunchStart = currentClock;
      const lunchEnd = lunchStart + 60;
      stops.push({
        id: `lunch-stop-fallback-day-${d + 1}`,
        type: "meal",
        name: `Lunch Break at ${resto.name}`,
        category: "Culinary Stop",
        arrivalTime: formatTime(lunchStart),
        departureTime: formatTime(lunchEnd),
        durationMinutes: 60,
        cost: resto.avgCostPerPerson,
        location: resto.location,
        description: `Authentic regional thali stop.`,
        lat: resto.lat,
        lng: resto.lng,
      });
      currentClock = lunchEnd + 15;
      remainingBudget -= resto.avgCostPerPerson;
      totalRuntimeMinutesAcc += 75;
      lunchInserted = true;
    }

    // Dinner insertion if late afternoon / evening
    if (currentClock >= 1050 && restaurantsPool.length > 0) {
      const resto = selectRestaurant(restaurantsPool, currentPos, strategy, "dinner", d + 1);
      const routeEval = evaluateRouteLeg(currentPos, resto, cityNodes);
      if (routeEval.isDirect) directRoadConnectionsUsed++;
      else {
        dijkstraFallbackCalls++;
        totalNodesVisited += routeEval.nodesVisited;
        totalEdgesRelaxed += routeEval.edgesRelaxed;
      }

      const distToDinner = routeEval.distanceKm;
      const isDinnerBoatTransition = currentPos.transportMode === "boat";

      if (isDinnerBoatTransition) {
        const transitStart = currentClock;
        const transitEnd = transitStart + 25;
        stops.push({
          id: `boat-transit-dinner-day-${d + 1}`,
          type: "transit",
          name: "Bet Dwarka to Okha Jetty Ferry",
          category: "Ferry Transit",
          arrivalTime: formatTime(transitStart),
          departureTime: formatTime(transitEnd),
          durationMinutes: 25,
          cost: 30,
          location: "Okha Jetty",
          description: "Ferry return transfer from Bet Dwarka island back to mainland Okha Jetty.",
          lat: 22.4633,
          lng: 69.1114,
        });
        currentClock = transitEnd + 5;
        remainingBudget -= 30;
        dayBoatKm += distToDinner;
      } else {
        dayRoadKm += distToDinner;
        const travelMins = routeEval.travelTimeMinutes;
        currentClock += travelMins;
      }

      currentPos = { lat: resto.lat, lng: resto.lng, transportMode: undefined };

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
        description: `Evening thali & local culinary dinner stop.`,
        lat: resto.lat,
        lng: resto.lng,
      });

      currentClock = dinnerEnd + 15;
      remainingBudget -= resto.avgCostPerPerson;
      totalRuntimeMinutesAcc += 75;
    }

    // Return to Hotel completing circular route
    const returnEval = evaluateRouteLeg(currentPos, startingHotel, cityNodes);
    if (returnEval.isDirect) directRoadConnectionsUsed++;
    else {
      dijkstraFallbackCalls++;
      totalNodesVisited += returnEval.nodesVisited;
      totalEdgesRelaxed += returnEval.edgesRelaxed;
    }

    const returnDist = returnEval.distanceKm;
    const isReturnBoatTransition = currentPos.transportMode === "boat";

    if (isReturnBoatTransition) {
      const transitStart = currentClock;
      const transitEnd = transitStart + 25;
      stops.push({
        id: `boat-transit-return-day-${d + 1}`,
        type: "transit",
        name: "Bet Dwarka to Okha Jetty Ferry",
        category: "Ferry Transit",
        arrivalTime: formatTime(transitStart),
        departureTime: formatTime(transitEnd),
        durationMinutes: 25,
        cost: 30,
        location: "Okha Jetty",
        description: "Ferry return transfer from Bet Dwarka island back to mainland Okha Jetty.",
        lat: 22.4633,
        lng: 69.1114,
      });
      currentClock = transitEnd + 5;
      remainingBudget -= 30;
      dayBoatKm += returnDist;
    } else {
      dayRoadKm += returnDist;
      const returnTravelMins = returnEval.travelTimeMinutes;
      currentClock += returnTravelMins;
    }

    const returnStart = currentClock;

    stops.push({
      id: `${startingHotel.id}-return-day-${d + 1}`,
      type: "hotel",
      name:
        language === "gu"
          ? `પાછા ફરો: ${startingHotel.name}`
          : language === "hi"
            ? `वापसी: ${startingHotel.name}`
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

    // Day total cost is the exact sum of all stops in the day
    const exactDayCost = stops.reduce((sum, s) => sum + s.cost, 0);

    const isLeisureDay = d >= attractionsPool.length;
    const dayTitle = isLeisureDay
      ? `Day ${d + 1}: ${activeCity.name} Cultural Living Heritage & Craft Circuit`
      : `Day ${d + 1}: ${strategyName} ${activeCity.name} Circuit`;

    dayPlans.push({
      dayNumber: d + 1,
      dateLabel: datesList[d % datesList.length],
      title: dayTitle,
      stops,
      totalKm: Math.round((dayRoadKm + dayBoatKm) * 10) / 10,
      roadKm: Math.round(dayRoadKm * 10) / 10,
      boatKm: Math.round(dayBoatKm * 10) / 10,
      totalCost: exactDayCost,
    });

    grandTotalRoadDistanceKm += dayRoadKm;
    grandTotalBoatDistanceKm += dayBoatKm;
    grandTotalCost += exactDayCost;
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
    totalDistanceKm: Math.round((grandTotalRoadDistanceKm + grandTotalBoatDistanceKm) * 10) / 10,
    roadDistanceKm: Math.round(grandTotalRoadDistanceKm * 10) / 10,
    boatDistanceKm: Math.round(grandTotalBoatDistanceKm * 10) / 10,
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
