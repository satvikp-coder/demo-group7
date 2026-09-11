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
import { selectStartingHotelWithInfo, filterAttractionsByBudget } from "@dsa/greedy/budgetAllocator";
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
  type: "hotel" | "attraction" | "meal" | "transit" | "cultural";
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
  hotelCost: number;
  attractionCost: number;
  mealCost: number;
  transitCost: number;
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
  hotelReplacementNotice?: string;
  hasNoCompatibleAttractions?: boolean;
  emptyStateReason?: string;
  dayPlans: DayRoute[];
  totalCost: number;
  hotelTotalCost: number;
  attractionTotalCost: number;
  mealTotalCost: number;
  transitTotalCost: number;
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
  if (!timeStr) return 8 * 60 + 30;
  const parts = timeStr.trim().split(" ");
  if (parts.length < 2) return 8 * 60 + 30;
  const [hStr, mStr] = parts[0].split(":");
  let hours = parseInt(hStr, 10) || 8;
  const mins = parseInt(mStr, 10) || 30;
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

// Curated cultural walking & artisan experiences for multi-day leisure distribution
const CITY_CULTURAL_EXPERIENCES: Record<string, Array<{ name: string; category: string; description: string; durationHours: number }>> = {
  ahmedabad: [
    { name: "Old City Pols & Heritage Haveli Walking Tour", category: "Heritage Walk", description: "Guided exploration of medieval pols, wooden carved facades, and secret subterranean rain-water harvesting tanks.", durationHours: 2 },
    { name: "Traditional Block Printing & Calico Textile Guilds", category: "Artisan Guild", description: "Interactive visit to master woodblock carvers and traditional Ajrakh textile artisans.", durationHours: 1.5 },
    { name: "Manek Chowk Traditional Sweets & Spice Bazaar", category: "Heritage Market", description: "Walking tour of Gujarat's oldest jewelry market transitioning into aromatic traditional street food corridors.", durationHours: 1.5 },
    { name: "Sabarmati Riverfront Promenade & Cultural Gardens", category: "Leisure Promenade", description: "Relaxing late afternoon scenic walk along the landscaped heritage riverfront promenades.", durationHours: 1.5 },
  ],
  somnath: [
    { name: "Prabhas Patan Ancient Pilgrim Stroll & Ocean Promenade", category: "Coastal Heritage", description: "Scenic coastal walk along the Arabian Sea breaking waves and ancient stone ghats.", durationHours: 2 },
    { name: "Sanskrit University & Ancient Manuscripts Gallery", category: "Cultural Study", description: "Exploration of preserved Vedic heritage texts and ancient maritime inscriptions.", durationHours: 1.5 },
    { name: "Veraval Dhow Ship-building Yard & Fisherman Wharf", category: "Maritime Craft", description: "Traditional wooden sea vessel craftsmanship and coastal trade heritage visit.", durationHours: 2 },
  ],
  dwarka: [
    { name: "Gomti Ghat Holy Dip & Holy Sea Confluence Walk", category: "Spiritual Heritage", description: "Sacred ghat walk along the Gomti river estuary meeting the roaring Arabian Sea.", durationHours: 1.5 },
    { name: "Gopi Talav & Holy Yellow Clay Artisan Guilds", category: "Craft & Lore", description: "Historic sacred pond famous for aromatic Gopi Chandan sacred clay crafting.", durationHours: 2 },
    { name: "Dwarka Lighthouse & Sunset Cliff Promenade", category: "Scenic Coastal", description: "Panoramic cliffside views over ancient submerged Dwarka archaeological waters.", durationHours: 1.5 },
  ],
  "rann-of-kutch": [
    { name: "Nirona Rogan Art & Copper Bell Artisan Workshop", category: "Master Craft", description: "Live demonstration by master Khatri craftsmen of 300-year-old castor seed oil Rogan fabric painting.", durationHours: 2 },
    { name: "Bhujodi Master Weaver & Ajrakhpur Block Print Guilds", category: "Textile Heritage", description: "Vibrant village interaction with Vankar weavers on traditional pit looms.", durationHours: 2 },
    { name: "White Rann Salt Desert Sunset & Stargazing Walk", category: "Salt Desert Immersion", description: "Expansive sunset walk across crystalline white salt flats under open desert skies.", durationHours: 2 },
  ],
  gir: [
    { name: "Maldhari Tribal Settlement & Forest Lore Walk", category: "Indigenous Culture", description: "Respectful cultural exchange with indigenous Maldhari pastoralists living harmoniously with Asiatic lions.", durationHours: 2 },
    { name: "Kamleshwar Dam Crocodile Sanctuary & Birding Deck", category: "Eco Sanctuary", description: "Panoramic birdwatching and marsh crocodile viewing atop Kamleshwar reservoir.", durationHours: 1.5 },
    { name: "Kesar Mango Orchard & Agro-Heritage Tour", category: "Agricultural Heritage", description: "Seasonal walk through organic Gir Kesar mango groves and traditional jaggery processing units.", durationHours: 1.5 },
  ],
  modhera: [
    { name: "Patan Rani Ki Vav Subterranean Sculptural Walk", category: "UNESCO Architecture", description: "In-depth inspection of 500+ Solanki sculptures across 7 stepped levels of the royal stepwell.", durationHours: 2 },
    { name: "Patan Patola Double-Ikat Silk Weaving Guild", category: "Master Craft", description: "Interactive visit with the Salvi family preserving the mathematical 8-month natural-dye silk weave.", durationHours: 2 },
    { name: "Surya Temple Ramakunda Geometrical Light Study", category: "Solar Geometry", description: "Observing afternoon light reflections across the 108 miniature stepped shrines of Ramakunda.", durationHours: 1.5 },
  ],
  champaner: [
    { name: "Pavagadh Ropeway & Ancient Citadel Fortifications Walk", category: "Fortress Heritage", description: "Ascent past 15th-century military gates, stepwells, and royal granaries overlooking the Narmada plains.", durationHours: 2.5 },
    { name: "Jami Masjid Stone Lattice Architecture Inspection", category: "Indo-Islamic Art", description: "Study of 172 fluted stone pillars and symmetry of Gujarat Sultanate architecture.", durationHours: 1.5 },
    { name: "Hadaf River & Forest Heritage Trail", category: "Eco Heritage", description: "Quiet forest path connecting secluded medieval mosques and stone water pavilions.", durationHours: 1.5 },
  ],
  saputara: [
    { name: "Dangi Tribal Craft & Bamboo Workshop", category: "Tribal Heritage", description: "Hands-on interaction with indigenous Warli painters and tribal bamboo artisans of the Dangs.", durationHours: 2 },
    { name: "Saputara Lake Serene Boat Circuit & Botanical Walk", category: "Hill Lake Promenade", description: "Pleasant afternoon lake promenade surrounded by Sahyadri forest canopies.", durationHours: 1.5 },
    { name: "Governor's Hill & Sunset Valley Lookout", category: "Scenic Viewpoint", description: "High vantage point overlooking deep Dang forest valleys and sunset vistas.", durationHours: 1.5 },
  ],
};

function selectRestaurant(
  restaurants: Restaurant[],
  currentPos: { lat?: number; lng?: number },
  strategy: OptimizationStrategy,
  dayIndex: number,
  isDinner: boolean = false
): Restaurant {
  if (!restaurants || restaurants.length === 0) {
    return {
      id: "local-dining",
      name: "Heritage Traditional Dining",
      lat: (currentPos.lat || 23.0) + 0.002,
      lng: (currentPos.lng || 72.5) + 0.002,
      rating: 4.5,
      avgCostPerPerson: 350,
      location: "City Center",
      cuisine: "Authentic Gujarati Thali",
    };
  }

  if (strategy === "budget-first") {
    // Pick the most economical restaurants to minimize expenditure
    const sortedByCost = [...restaurants].sort((a, b) => a.avgCostPerPerson - b.avgCostPerPerson);
    const options = sortedByCost.slice(0, Math.min(2, sortedByCost.length));
    const offset = isDinner ? 1 : 0;
    return options[(dayIndex + offset) % options.length];
  } else if (strategy === "rating-first") {
    // Pick top-rated culinary dining experiences
    const sortedByRating = [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const options = sortedByRating.slice(0, Math.min(2, sortedByRating.length));
    const offset = isDinner ? 1 : 0;
    return options[(dayIndex + offset) % options.length];
  } else {
    // Distance-first: Pick the nearest restaurant to the current position
    const sortedByDist = [...restaurants].sort((a, b) => {
      const distA = getDistanceKm(currentPos.lat, currentPos.lng, a.lat, a.lng);
      const distB = getDistanceKm(currentPos.lat, currentPos.lng, b.lat, b.lng);
      return distA - distB;
    });
    return sortedByDist[0];
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
  const totalBudgetCap = config.budget || 12000;

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
    strategyTagline = "Top-rated cultural landmarks (>= 4.6★ quality)";
  }

  // 1. Hotel Selection according to strategy respecting budget
  const hotelSelection = selectStartingHotelWithInfo(
    activeCity.hotels,
    totalBudgetCap,
    numDays,
    strategy,
    config.startingHotelId
  );
  const startingHotel = hotelSelection.hotel;
  const hotelReplacementNotice = hotelSelection.isReplaced
    ? hotelSelection.replacementReason
    : undefined;

  const hotelTotalCost = startingHotel.priceNumeric * numDays;
  let remainingBudget = totalBudgetCap - hotelTotalCost;

  let attractionsPool = [...(activeCity.attractions || [])];
  if (config.wheelchairAccessibleOnly) {
    attractionsPool = attractionsPool.filter(
      (a) => a.wheelchairAccessible === true,
    );
  }

  // Early empty state: wheelchair-only selected but 0 accessible attractions in destination
  if (config.wheelchairAccessibleOnly && attractionsPool.length === 0) {
    const endTimeMs = performance.now();
    return {
      strategy,
      strategyName,
      strategyTagline,
      activeCity,
      startingHotel,
      hotelReplacementNotice,
      hasNoCompatibleAttractions: true,
      emptyStateReason: `No wheelchair-accessible heritage attractions are currently cataloged for ${activeCity.name}. Please disable the wheelchair-only filter or choose another destination (such as Somnath, Ahmedabad, or Dwarka).`,
      dayPlans: [],
      totalCost: hotelTotalCost,
      hotelTotalCost,
      attractionTotalCost: 0,
      mealTotalCost: 0,
      transitTotalCost: 0,
      totalDistanceKm: 0,
      roadDistanceKm: 0,
      boatDistanceKm: 0,
      attractionCount: 0,
      totalRuntimeMinutes: 0,
      totalRuntimeHours: "0 hrs",
      stats: {
        attractionsConsidered: 0,
        attractionsVisited: 0,
        directRoadConnectionsUsed: 0,
        dijkstraFallbackCalls: 0,
        nodesVisited: 0,
        edgesRelaxed: 0,
        executionTimeMs: Math.max(
          0.1,
          Math.round((endTimeMs - startTimeMs) * 100) / 100,
        ),
      },
    };
  }
  const restaurantsPool = activeCity.restaurants || [];
  const visitedAttractionIds = new HashTable<string, boolean>();

  const dayPlans: DayRoute[] = [];
  let grandTotalRoadDistanceKm = 0;
  let grandTotalBoatDistanceKm = 0;
  let grandTotalAttractionCost = 0;
  let grandTotalMealCost = 0;
  let grandTotalTransitCost = 0;
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

  const cityCulturalStops = CITY_CULTURAL_EXPERIENCES[activeCity.id] || CITY_CULTURAL_EXPERIENCES["ahmedabad"];
  let culturalStopCursor = 0;

  for (let d = 0; d < numDays; d++) {
    const stops: ItineraryStop[] = [];
    let currentClock = startMinsBase;
    let dayRoadKm = 0;
    let dayBoatKm = 0;
    let dayAttractionCost = 0;
    let dayMealCost = 0;
    let dayTransitCost = 0;
    let currentPos = {
      lat: startingHotel.lat,
      lng: startingHotel.lng,
      id: startingHotel.id,
      transportMode: undefined as string | undefined,
    };

    // Stop #1: Depart Hotel Base
    const hotelDepartMins = currentClock;
    stops.push({
      id: `${startingHotel.id}-start-day-${d + 1}`,
      type: "hotel",
      name:
        language === "gu"
          ? `રવાના: ${startingHotel.name}`
          : language === "hi"
            ? `રવાના: ${startingHotel.name}`
            : `Depart ${startingHotel.name}`,
      category: "Starting Accommodation",
      arrivalTime: formatTime(hotelDepartMins),
      departureTime: formatTime(hotelDepartMins + 15),
      durationMinutes: 15,
      cost: startingHotel.priceNumeric,
      location: startingHotel.location,
      imageUrl: startingHotel.imageUrl,
      description: `Morning departure from hotel base (₹${startingHotel.priceNumeric.toLocaleString("en-IN")} / night stay).`,
      lat: startingHotel.lat,
      lng: startingHotel.lng,
    });

    currentClock += 15;
    totalRuntimeMinutesAcc += 15;

    let lunchInserted = false;
    let dayAttractionCount = 0;

    const remainingDays = numDays - d;
    const unvisitedCandidates = filterAttractionsByBudget(attractionsPool, remainingBudget, visitedAttractionIds);
    const maxAttractionsToday = getMaxAttractionsPerDay(unvisitedCandidates.length, remainingDays, strategy);

    // Morning attraction exploration loop
    while (dayAttractionCount < maxAttractionsToday) {
      const unvisited = filterAttractionsByBudget(attractionsPool, remainingBudget, visitedAttractionIds);
      if (unvisited.length === 0) break;

      // Sort unvisited candidates with mergeSort by strategy score
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
      const isBoatTransition =
        (currentPos.transportMode === "boat" && chosen.transportMode !== "boat") ||
        (currentPos.transportMode !== "boat" && chosen.transportMode === "boat");

      if (isBoatTransition && !config.wheelchairAccessibleOnly) {
        const transitStart = currentClock;
        const transitEnd = transitStart + 25;
        stops.push({
          id: `boat-transit-${chosen.id}-day-${d + 1}`,
          type: "transit",
          name:
            currentPos.transportMode === "boat"
              ? "Bet Dwarka to Okha Jetty Ferry"
              : "Okha Jetty to Bet Dwarka Ferry",
          category: "Ferry Transit",
          arrivalTime: formatTime(transitStart),
          departureTime: formatTime(transitEnd),
          durationMinutes: 25,
          cost: 30,
          location: "Okha Jetty",
          description:
            currentPos.transportMode === "boat"
              ? "Ferry return transfer from Bet Dwarka island to mainland Okha Jetty."
              : "Mainland Okha Jetty ferry crossing to Bet Dwarka island (~25 mins).",
          lat: 22.4633,
          lng: 69.1114,
        });
        currentClock = transitEnd + 5;
        dayTransitCost += 30;
        remainingBudget -= 30;
        dayBoatKm += distToChosen;
        totalRuntimeMinutesAcc += 30;
      } else {
        dayRoadKm += distToChosen;
        const travelMins = routeEval.travelTimeMinutes;
        currentClock += travelMins;
        totalRuntimeMinutesAcc += travelMins;
      }

      currentPos = {
        lat: chosen.lat,
        lng: chosen.lng,
        id: chosen.id,
        transportMode: chosen.transportMode,
      };

      const attrStart = currentClock;
      const durationMins = Math.round((chosen.durationHours || 1.5) * 60);
      const attrEnd = attrStart + durationMins;

      const fee = chosen.entryFeeNumeric || 0;
      dayAttractionCost += fee;
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

      // Check if it's lunch time between attractions
      if (!lunchInserted && currentClock >= 720 && restaurantsPool.length > 0) {
        break;
      }
    }

    // If all core monuments are covered across the multi-day trip, provide a structured cultural immersion experience
    if (dayAttractionCount === 0 && cityCulturalStops.length > 0) {
      const cultStop = cityCulturalStops[culturalStopCursor % cityCulturalStops.length];
      culturalStopCursor++;

      const cultStart = Math.max(currentClock, startMinsBase + 30);
      const durationMins = Math.round(cultStop.durationHours * 60);
      const cultEnd = cultStart + durationMins;

      dayRoadKm += 2.5;
      currentClock = cultStart;

      stops.push({
        id: `cultural-stop-day-${d + 1}`,
        type: "cultural",
        name: cultStop.name,
        category: cultStop.category,
        arrivalTime: formatTime(cultStart),
        departureTime: formatTime(cultEnd),
        durationMinutes: durationMins,
        cost: 0,
        location: activeCity.location,
        description: `${cultStop.description} (Curated cultural immersion for Day ${d + 1}).`,
        lat: startingHotel.lat + 0.008,
        lng: startingHotel.lng + 0.008,
        physicalDemand: "low",
        wheelchairAccessible: true,
      });

      currentClock = cultEnd + 15;
      totalRuntimeMinutesAcc += durationMins + 15;
      dayAttractionCount++;
    }

    // Structured Lunch Break (12:30 PM - 1:30 PM window)
    if (restaurantsPool.length > 0) {
      const resto = selectRestaurant(restaurantsPool, currentPos, strategy, d, false);

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
        dayTransitCost += 30;
        remainingBudget -= 30;
        dayBoatKm += distToResto;
      } else {
        dayRoadKm += distToResto;
        const travelMins = routeEval.travelTimeMinutes;
        currentClock += travelMins;
      }

      currentPos = {
        lat: resto.lat,
        lng: resto.lng,
        id: resto.id,
        transportMode: undefined,
      };

      // Standardize lunch start to at least 12:30 PM (750 mins)
      const lunchStart = Math.max(currentClock, 750);
      const lunchEnd = lunchStart + 60;
      const mealCost = resto.avgCostPerPerson || 375;

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
        cost: mealCost,
        location: resto.location,
        description: `Authentic ${resto.cuisine || "Gujarati thali"} regional lunch.`,
        lat: resto.lat,
        lng: resto.lng,
      });

      currentClock = lunchEnd + 15;
      dayMealCost += mealCost;
      remainingBudget -= mealCost;
      totalRuntimeMinutesAcc += 75;
      lunchInserted = true;
    }

    // Afternoon attraction or secondary cultural exploration
    if (dayAttractionCount < maxAttractionsToday) {
      const unvisited = filterAttractionsByBudget(attractionsPool, remainingBudget, visitedAttractionIds);
      if (unvisited.length > 0) {
        const sortedCandidates = mergeSort(unvisited, (a, b) => {
          const scoreA = scoreAttraction(a, currentPos, remainingBudget, strategy, getDistanceKm);
          const scoreB = scoreAttraction(b, currentPos, remainingBudget, strategy, getDistanceKm);
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
        dayRoadKm += distToChosen;
        currentClock += routeEval.travelTimeMinutes;

        currentPos = {
          lat: chosen.lat,
          lng: chosen.lng,
          id: chosen.id,
          transportMode: chosen.transportMode,
        };

        const attrStart = currentClock;
        const durationMins = Math.round((chosen.durationHours || 1.5) * 60);
        const attrEnd = attrStart + durationMins;
        const fee = chosen.entryFeeNumeric || 0;

        dayAttractionCost += fee;
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
    } else if (currentClock < 960 && cityCulturalStops.length > 0 && d >= 3) {
      // For longer trips (Days 4+), add a relaxing afternoon bazaar / crafts walk
      const cultStop = cityCulturalStops[(culturalStopCursor + 1) % cityCulturalStops.length];
      const cultStart = currentClock + 15;
      const durationMins = 75;
      const cultEnd = cultStart + durationMins;

      dayRoadKm += 1.8;
      stops.push({
        id: `afternoon-cultural-day-${d + 1}`,
        type: "cultural",
        name: cultStop.name,
        category: cultStop.category,
        arrivalTime: formatTime(cultStart),
        departureTime: formatTime(cultEnd),
        durationMinutes: durationMins,
        cost: 0,
        location: activeCity.location,
        description: `Afternoon stroll: ${cultStop.description}`,
        lat: startingHotel.lat + 0.005,
        lng: startingHotel.lng + 0.005,
        physicalDemand: "low",
        wheelchairAccessible: true,
      });

      currentClock = cultEnd + 15;
      totalRuntimeMinutesAcc += durationMins + 15;
    }

    // Evening Dining / Tea Stop if day extends to evening (>= 5:30 PM / 1050 mins)
    if (currentClock >= 1050 && restaurantsPool.length > 0) {
      const dinnerResto = selectRestaurant(restaurantsPool, currentPos, strategy, d, true);
      const routeEval = evaluateRouteLeg(currentPos, dinnerResto, cityNodes);
      if (routeEval.isDirect) directRoadConnectionsUsed++;
      else {
        dijkstraFallbackCalls++;
        totalNodesVisited += routeEval.nodesVisited;
        totalEdgesRelaxed += routeEval.edgesRelaxed;
      }

      dayRoadKm += routeEval.distanceKm;
      currentClock += routeEval.travelTimeMinutes;

      currentPos = {
        lat: dinnerResto.lat,
        lng: dinnerResto.lng,
        id: dinnerResto.id,
        transportMode: undefined,
      };

      const dinnerStart = currentClock;
      const dinnerEnd = dinnerStart + 60;
      const mealCost = dinnerResto.avgCostPerPerson || 375;

      stops.push({
        id: `dinner-stop-day-${d + 1}`,
        type: "meal",
        name:
          language === "gu"
            ? `સાંજનું ભોજન: ${dinnerResto.name}`
            : language === "hi"
              ? `रात्रि का भोजन: ${dinnerResto.name}`
              : `Evening Dining at ${dinnerResto.name}`,
        category: "Evening Dining",
        arrivalTime: formatTime(dinnerStart),
        departureTime: formatTime(dinnerEnd),
        durationMinutes: 60,
        cost: mealCost,
        location: dinnerResto.location,
        description: `Traditional dinner & evening refreshment stop.`,
        lat: dinnerResto.lat,
        lng: dinnerResto.lng,
      });

      currentClock = dinnerEnd + 15;
      dayMealCost += mealCost;
      remainingBudget -= mealCost;
      totalRuntimeMinutesAcc += 75;
    }

    // Return to Hotel Base completing circular loop
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
      dayTransitCost += 30;
      remainingBudget -= 30;
      dayBoatKm += returnDist;
    } else {
      dayRoadKm += returnDist;
      currentClock += returnEval.travelTimeMinutes;
    }

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

    // Day total cost accounts for accommodation night + attraction fees + meals + transit
    const dayTotalCost = startingHotel.priceNumeric + dayAttractionCost + dayMealCost + dayTransitCost;

    dayPlans.push({
      dayNumber: d + 1,
      dateLabel: datesList[d % datesList.length],
      title: `Day ${d + 1}: ${strategyName} ${activeCity.name} Circuit`,
      stops,
      totalKm: Math.round((dayRoadKm + dayBoatKm) * 10) / 10,
      roadKm: Math.round(dayRoadKm * 10) / 10,
      boatKm: Math.round(dayBoatKm * 10) / 10,
      totalCost: dayTotalCost,
      hotelCost: startingHotel.priceNumeric,
      attractionCost: dayAttractionCost,
      mealCost: dayMealCost,
      transitCost: dayTransitCost,
    });

    grandTotalRoadDistanceKm += dayRoadKm;
    grandTotalBoatDistanceKm += dayBoatKm;
    grandTotalAttractionCost += dayAttractionCost;
    grandTotalMealCost += dayMealCost;
    grandTotalTransitCost += dayTransitCost;
  }

  const grandTotalCost = hotelTotalCost + grandTotalAttractionCost + grandTotalMealCost + grandTotalTransitCost;

  const hoursFloat = Math.round((totalRuntimeMinutesAcc / 60) * 10) / 10;
  const totalRuntimeHours = `${hoursFloat} hrs`;

  const endTimeMs = performance.now();
  const executionTimeMs = Math.max(
    0.1,
    Math.round((endTimeMs - startTimeMs) * 100) / 100,
  );

  const hasNoCompatibleAttractions = totalAttractionsVisited === 0;
  const emptyStateReason = hasNoCompatibleAttractions
    ? config.wheelchairAccessibleOnly
      ? `No wheelchair-accessible attractions could be visited within your budget of ₹${totalBudgetCap.toLocaleString("en-IN")}. Please increase your budget or adjust your trip duration.`
      : `Your budget of ₹${totalBudgetCap.toLocaleString("en-IN")} is insufficient to cover accommodation and heritage attraction entries. Please increase your budget.`
    : undefined;

  return {
    strategy,
    strategyName,
    strategyTagline,
    activeCity,
    startingHotel,
    hotelReplacementNotice,
    hasNoCompatibleAttractions,
    emptyStateReason,
    dayPlans,
    totalCost: Math.round(grandTotalCost),
    hotelTotalCost,
    attractionTotalCost: grandTotalAttractionCost,
    mealTotalCost: grandTotalMealCost,
    transitTotalCost: grandTotalTransitCost,
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

  if (costDiff > 0) {
    statement = `Budget-first saves ₹${costDiff.toLocaleString("en-IN")} compared to Rating-first`;
  } else if (costDiff < 0) {
    statement = `Rating-first achieves ₹${Math.abs(costDiff).toLocaleString("en-IN")} lower expenditure`;
  } else {
    statement = `Budget-first and Rating-first both operate at ₹${bRes.totalCost.toLocaleString("en-IN")}`;
  }

  if (distSaved > 0) {
    statement += `, while Distance-first reduces total transit by ${distSaved} km.`;
  } else {
    statement += `, while Distance-first minimizes intra-city transit times.`;
  }

  return statement;
}
