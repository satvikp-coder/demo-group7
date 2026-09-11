import {
  generateStrategyItinerary,
  PlannerConfigPayload,
} from "../../frontend/src/utils/itineraryPlanner";
import {
  selectStartingHotelWithInfo,
  filterAttractionsByBudget,
} from "../../dsa/greedy/budgetAllocator";
import {
  GUJARAT_DESTINATIONS,
  getCityById,
} from "../../frontend/src/data/destinations";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("=== Running Trip Planner & Itinerary Generation Logic Tests ===\n");

// --- TEST CASE 1: Somnath + Normal Route ---
console.log("--- Test Case 1: Somnath + Normal Route ---");
{
  const config: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 2,
    budget: 10000,
    startingHotelId: "premier-somnath",
    startTime: "08:00 AM",
    strategy: "distance-first",
    wheelchairAccessibleOnly: false,
  };

  const result = generateStrategyItinerary(config, "distance-first", "en");
  assert(result.activeCity.id === "somnath", "Destination must be Somnath");
  assert(result.startingHotel.id === "premier-somnath", "Starting hotel should be premier-somnath");
  assert(result.dayPlans.length === 2, "Should have 2 day plans");

  // In normal route, non-wheelchair-accessible attractions can be selected
  const allStops = result.dayPlans.flatMap((d) => d.stops);
  const attractionStops = allStops.filter((s) => s.type === "attraction");
  assert(attractionStops.length > 0, "Should have scheduled attractions");

  const hasInaccessible = attractionStops.some((s) => s.wheelchairAccessible === false);
  assert(hasInaccessible, "Normal route can include attractions that are not wheelchair accessible (e.g. Triveni Sangam or Somnath Beach)");

  const somnathCity = getCityById("somnath")!;
  const title = `${somnathCity.name} Circular Heritage Circuit`;
  assert(title === "Somnath Circular Heritage Circuit", "Title must be 'Somnath Circular Heritage Circuit'");
}

// --- TEST CASE 2: Somnath + Wheelchair-Only Route ---
console.log("\n--- Test Case 2: Somnath + Wheelchair-Only Route ---");
{
  const config: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 2,
    budget: 10000,
    startingHotelId: "premier-somnath",
    startTime: "08:00 AM",
    strategy: "distance-first",
    wheelchairAccessibleOnly: true,
  };

  const result = generateStrategyItinerary(config, "distance-first", "en");
  assert(result.activeCity.id === "somnath", "Destination must be Somnath");

  const allStops = result.dayPlans.flatMap((d) => d.stops);
  const attractionStops = allStops.filter((s) => s.type === "attraction");
  assert(attractionStops.length > 0, "Should have scheduled attractions for Somnath");

  // Verify that ZERO stops in wheelchair-only mode have wheelchairAccessible === false
  const inaccessibleAttractions = attractionStops.filter((s) => s.wheelchairAccessible === false);
  assert(
    inaccessibleAttractions.length === 0,
    `Wheelchair-only route must NOT contain any inaccessible attractions. Found: ${inaccessibleAttractions.map((s) => s.name).join(", ")}`
  );

  // Specifically verify that Triveni Sangam and Somnath Beach are NOT present
  const badNames = ["Triveni Sangam", "Somnath Beach"];
  const containsBad = attractionStops.some((s) => badNames.includes(s.name));
  assert(!containsBad, "Must not contain Triveni Sangam or Somnath Beach when wheelchair-only is enabled");

  // Verify all attraction stops explicitly have wheelchairAccessible === true
  assert(
    attractionStops.every((s) => s.wheelchairAccessible === true),
    "All scheduled attractions must be wheelchair-accessible"
  );
}

// --- TEST CASE 3: Different Hotel Selection ---
console.log("\n--- Test Case 3: Different Hotel Selection ---");
{
  // Sarovar Portico Somnath (₹3,500/night)
  // Fern Residency Somnath (₹4,200/night)
  // Hotel The Premier Somnath (₹1,047/night)

  // 3A: User explicitly selects Fern Residency with adequate budget (₹15,000 for 2 days -> ₹8,400 hotel)
  const configFern: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 2,
    budget: 15000,
    startingHotelId: "fern-residency-somnath",
    startTime: "08:00 AM",
    strategy: "budget-first", // Even in budget-first, user's explicit choice must be honored if compatible!
  };

  const resultFern = generateStrategyItinerary(configFern, "budget-first", "en");
  assert(
    resultFern.startingHotel.id === "fern-residency-somnath",
    `User selected hotel 'fern-residency-somnath' must be honored when affordable. Got: ${resultFern.startingHotel.id}`
  );
  assert(
    resultFern.hotelReplacementNotice === undefined,
    "No replacement notice should be shown when hotel is honored"
  );

  // 3B: User explicitly selects Fern Residency with INSUFFICIENT budget (₹5,000 for 2 days -> ₹8,400 > ₹5,000)
  const configFernLowBudget: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 2,
    budget: 5000,
    startingHotelId: "fern-residency-somnath",
    startTime: "08:00 AM",
    strategy: "budget-first",
  };

  const resultFernReplaced = generateStrategyItinerary(configFernLowBudget, "budget-first", "en");
  assert(
    resultFernReplaced.startingHotel.id === "premier-somnath",
    "Should replace with affordable hotel when selected hotel exceeds total budget"
  );
  assert(
    resultFernReplaced.hotelReplacementNotice !== undefined &&
      resultFernReplaced.hotelReplacementNotice.includes("exceeds your total trip budget"),
    `Must provide clear non-silent explanation for hotel replacement. Got: ${resultFernReplaced.hotelReplacementNotice}`
  );
}

// --- TEST CASE 4: Different Budget Values ---
console.log("\n--- Test Case 4: Different Budget Values ---");
{
  // Low budget: ₹3,000 for 1 day
  const configLow: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 1,
    budget: 3000,
    startingHotelId: "premier-somnath",
    startTime: "08:00 AM",
    strategy: "budget-first",
  };
  const resultLow = generateStrategyItinerary(configLow, "budget-first", "en");
  assert(resultLow.totalCost <= 3000, `Total cost ₹${resultLow.totalCost} must not exceed budget ₹3,000`);

  // High budget: ₹25,000 for 3 days
  const configHigh: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 3,
    budget: 25000,
    startingHotelId: "sarovar-portico-somnath",
    startTime: "08:00 AM",
    strategy: "rating-first",
  };
  const resultHigh = generateStrategyItinerary(configHigh, "rating-first", "en");
  assert(resultHigh.totalCost <= 25000, `Total cost ₹${resultHigh.totalCost} must not exceed budget ₹25,000`);
  assert(resultHigh.dayPlans.length === 3, "Should have 3 days planned");
}

// --- TEST CASE 5: Different Destination ---
console.log("\n--- Test Case 5: Different Destination (Ahmedabad) ---");
{
  const configAhm: PlannerConfigPayload = {
    cityId: "ahmedabad",
    tripDays: 2,
    budget: 12000,
    startingHotelId: "lemon-tree-premier",
    startTime: "08:00 AM",
    strategy: "distance-first",
  };

  const resultAhm = generateStrategyItinerary(configAhm, "distance-first", "en");
  assert(resultAhm.activeCity.id === "ahmedabad", "City must be Ahmedabad");
  assert(resultAhm.startingHotel.id === "lemon-tree-premier", "Hotel must be in Ahmedabad (lemon-tree-premier)");

  const ahmTitle = `${resultAhm.activeCity.name} Circular Heritage Circuit`;
  assert(ahmTitle === "Ahmedabad Circular Heritage Circuit", "Title must be 'Ahmedabad Circular Heritage Circuit'");
  assert(!ahmTitle.includes("Somnath"), "Ahmedabad title must not contain 'Somnath'");

  const allAhmStops = resultAhm.dayPlans.flatMap((d) => d.stops).filter((s) => s.type === "attraction");
  const ahmAttractionIds = getCityById("ahmedabad")!.attractions.map((a) => a.id);
  assert(
    allAhmStops.every((s) => ahmAttractionIds.some((id) => s.id.startsWith(id))),
    "All scheduled attractions must belong to Ahmedabad"
  );
}

// --- TEST CASE 6: Changing Destination After Generation ---
console.log("\n--- Test Case 6: Changing Destination After Generation ---");
{
  // Plan for Somnath first
  const config1: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 2,
    budget: 9000,
    startingHotelId: "premier-somnath",
    startTime: "08:00 AM",
  };
  const res1 = generateStrategyItinerary(config1, "distance-first", "en");
  const title1 = `${res1.activeCity.name} Circular Heritage Circuit`;
  assert(title1 === "Somnath Circular Heritage Circuit", "Initial title is Somnath");

  // User changes destination to Dwarka
  const config2: PlannerConfigPayload = {
    cityId: "dwarka",
    tripDays: 2,
    budget: 9000,
    startingHotelId: "darshan-palace",
    startTime: "08:00 AM",
  };
  const res2 = generateStrategyItinerary(config2, "distance-first", "en");
  const title2 = `${res2.activeCity.name} Circular Heritage Circuit`;
  assert(title2 === "Dwarka Circular Heritage Circuit", "Changed title is Dwarka");
  assert(res2.activeCity.id === "dwarka", "Active city updated to Dwarka");
  assert(res2.startingHotel.id === "darshan-palace", "Starting hotel updated to Dwarka hotel");
}

// --- TEST CASE 7: Adjust Plan (Modifying days & budget) ---
console.log("\n--- Test Case 7: Adjust Plan ---");
{
  const initialConfig: PlannerConfigPayload = {
    cityId: "modhera",
    tripDays: 1,
    budget: 5000,
    startingHotelId: "toran-mehsana",
    startTime: "08:00 AM",
  };
  const resInitial = generateStrategyItinerary(initialConfig, "distance-first", "en");
  assert(resInitial.dayPlans.length === 1, "Initial plan has 1 day");

  // Adjusted plan: 2 days, higher budget
  const adjustedConfig: PlannerConfigPayload = {
    ...initialConfig,
    tripDays: 2,
    budget: 10000,
  };
  const resAdjusted = generateStrategyItinerary(adjustedConfig, "distance-first", "en");
  assert(resAdjusted.dayPlans.length === 2, "Adjusted plan has 2 days");
  assert(resAdjusted.activeCity.id === "modhera", "City remains Modhera");
}

// --- TEST CASE 8: Regenerate (With different strategy & accessibility toggle) ---
console.log("\n--- Test Case 8: Regenerate ---");
{
  const baseConfig: PlannerConfigPayload = {
    cityId: "rann-of-kutch",
    tripDays: 2,
    budget: 12000,
    startingHotelId: "toran-rann",
    startTime: "08:00 AM",
    wheelchairAccessibleOnly: false,
  };
  const resNormal = generateStrategyItinerary(baseConfig, "distance-first", "en");

  // Regenerate with wheelchair-only toggle turned ON
  const regeneratedConfig: PlannerConfigPayload = {
    ...baseConfig,
    wheelchairAccessibleOnly: true,
  };
  const resRegen = generateStrategyItinerary(regeneratedConfig, "distance-first", "en");

  const normalAttractions = resNormal.dayPlans.flatMap((d) => d.stops).filter((s) => s.type === "attraction");
  const regenAttractions = resRegen.dayPlans.flatMap((d) => d.stops).filter((s) => s.type === "attraction");

  assert(
    regenAttractions.every((s) => s.wheelchairAccessible === true),
    "Regenerated plan with wheelchair-only must contain ONLY wheelchair-accessible attractions"
  );
}

// --- TEST CASE 9: Empty / No-Compatible-Result Case ---
console.log("\n--- Test Case 9: Empty / No-Compatible-Result Case ---");
{
  // Budget so low (₹500 for 2 days) that even the cheapest hotel (₹1,047/night) leaves zero budget for attractions
  const configZeroBudget: PlannerConfigPayload = {
    cityId: "somnath",
    tripDays: 2,
    budget: 500,
    startingHotelId: "premier-somnath",
    startTime: "08:00 AM",
  };
  const resZero = generateStrategyItinerary(configZeroBudget, "budget-first", "en");
  assert(
    resZero.hasNoCompatibleAttractions === true,
    "Should flag hasNoCompatibleAttractions when budget is insufficient to visit any attractions"
  );
  assert(
    resZero.emptyStateReason !== undefined && resZero.emptyStateReason.length > 0,
    `Empty state reason must be provided. Got: ${resZero.emptyStateReason}`
  );
}

console.log("\n🎉 All 9 Trip Planner and Itinerary-Generation Test Cases PASSED!\n");
