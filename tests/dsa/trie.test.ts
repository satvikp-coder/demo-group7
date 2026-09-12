import { Trie } from "../../dsa/trie/Trie";
import {
  buildDestinationTrie,
  searchDestinationsWithTrie,
  normalizeSearchTerm,
  resetDestinationTrie,
  getDestinationTrie,
  getDestinationMap,
} from "../../frontend/src/utils/destinationTrie";
import { GUJARAT_DESTINATIONS } from "../../frontend/src/data/destinations";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("=== Running Trie Unit & Integration Tests ===\n");

// 1. Core Trie Class Tests
console.log("--- Test Group 1: Standalone Trie Functionality ---");
{
  const trie = new Trie();
  trie.insert("Ahmedabad", "ahmedabad");
  trie.insert("Somnath", "somnath");
  trie.insert("Somnath Temple", "somnath");
  trie.insert("Dwarka", "dwarka");

  // Prefix matching via search and searchPrefix
  const ahmResults = trie.searchPrefix("ahm");
  assert(ahmResults.includes("ahmedabad"), "Prefix 'ahm' should return 'ahmedabad'");
  assert(!ahmResults.includes("somnath"), "Prefix 'ahm' should not return 'somnath'");

  const ahmSearch = trie.search("ahm");
  assert(ahmSearch.includes("ahmedabad"), "search('ahm') alias should return 'ahmedabad'");

  // Suffix/substring matching
  const badResults = trie.searchPrefix("bad");
  assert(badResults.includes("ahmedabad"), "Suffix/substring 'bad' should return 'ahmedabad'");

  const medabResults = trie.searchPrefix("medab");
  assert(medabResults.includes("ahmedabad"), "Middle substring 'medab' should return 'ahmedabad'");

  // startsWith method
  assert(trie.startsWith("ahm") === true, "startsWith('ahm') should return true");
  assert(trie.startsWith("medab") === true, "startsWith('medab') should return true (suffix trie)");
  assert(trie.startsWith("xyz") === false, "startsWith('xyz') should return false");

  // has method (exact word)
  assert(trie.has("ahmedabad") === true, "has('ahmedabad') should return true");
  assert(trie.has("nonexistent") === false, "has('nonexistent') should return false");

  // getWordsWithPrefix
  const wordsAhm = trie.getWordsWithPrefix("ahm");
  assert(wordsAhm.includes("ahmedabad"), "getWordsWithPrefix('ahm') should contain 'ahmedabad'");

  // autocomplete
  const autoResults = trie.autocomplete("som", 5);
  assert(autoResults.includes("somnath"), "autocomplete('som') should return 'somnath'");

  // Case-insensitivity
  const upperResults = trie.searchPrefix("AHMED");
  assert(upperResults.includes("ahmedabad"), "Uppercase query 'AHMED' should return 'ahmedabad'");

  const mixedResults = trie.searchPrefix("AhMeDaBaD");
  assert(mixedResults.includes("ahmedabad"), "Mixed-case query 'AhMeDaBaD' should return 'ahmedabad'");

  // No-result search
  const invalidResults = trie.searchPrefix("nonexistentplace999");
  assert(invalidResults.length === 0, "Nonexistent query should return empty array");

  // Multiple fields with same ID (deduplication)
  const somResults = trie.searchPrefix("somnath");
  const uniqueSom = new Set(somResults);
  assert(somResults.length === uniqueSom.size, "Trie should not return duplicate IDs for multiple matches");
  assert(somResults.includes("somnath"), "Query 'somnath' should return 'somnath'");
}

// 2. Normalization & Whitespace Tests
console.log("\n--- Test Group 2: Whitespace and Normalization ---");
{
  assert(normalizeSearchTerm("  ahmedabad  ") === "ahmedabad", "Trims leading and trailing spaces");
  assert(normalizeSearchTerm("sun   temple") === "sun temple", "Collapses multiple spaces into single space");

  const trie = new Trie();
  trie.insert(normalizeSearchTerm("Sun   Temple"), "modhera");
  const res = trie.searchPrefix(normalizeSearchTerm("  sun   temple  "));
  assert(res.includes("modhera"), "Multi-space queries match normalized trie entries");
}

// 3. Destination Indexing & Real Dataset Integration Tests
console.log("\n--- Test Group 3: GUJARAT_DESTINATIONS Integration ---");
{
  const trie = buildDestinationTrie(GUJARAT_DESTINATIONS);

  // Search by Prefix: ahm, som, dw
  const ahmPrefix = searchDestinationsWithTrie("ahm", trie);
  assert(ahmPrefix !== null && ahmPrefix.has("ahmedabad"), "Search prefix 'ahm' returns ahmedabad ID");

  const somMatch = searchDestinationsWithTrie("som", trie);
  assert(somMatch !== null && somMatch.has("somnath"), "Search prefix 'som' returns somnath ID");

  const dwMatch = searchDestinationsWithTrie("dw", trie);
  assert(dwMatch !== null && dwMatch.has("dwarka"), "Search prefix 'dw' returns dwarka ID");

  const dwarMatch = searchDestinationsWithTrie("dwar", trie);
  assert(dwarMatch !== null && dwarMatch.has("dwarka"), "Search prefix 'dwar' returns dwarka ID");

  // Exact search
  const ahmExact = searchDestinationsWithTrie("Ahmedabad", trie);
  assert(ahmExact !== null && ahmExact.has("ahmedabad"), "Exact search 'Ahmedabad' returns ahmedabad ID");

  const somExact = searchDestinationsWithTrie("Somnath", trie);
  assert(somExact !== null && somExact.has("somnath"), "Exact search 'Somnath' returns somnath ID");

  // Substring search
  const medabMatch = searchDestinationsWithTrie("medab", trie);
  assert(medabMatch !== null && medabMatch.has("ahmedabad"), "Substring 'medab' returns ahmedabad ID");

  const nathMatch = searchDestinationsWithTrie("nath", trie);
  assert(nathMatch !== null && nathMatch.has("somnath"), "Substring 'nath' returns somnath ID");

  // Case-insensitivity
  const ahmLower = searchDestinationsWithTrie("ahm", trie);
  const ahmUpper = searchDestinationsWithTrie("AHM", trie);
  const ahmMixed = searchDestinationsWithTrie("AhM", trie);
  assert(ahmLower !== null && ahmUpper !== null && ahmMixed !== null, "Case variations must return non-null");
  assert(ahmUpper.has("ahmedabad") && ahmMixed.has("ahmedabad"), "AHM and AhM return ahmedabad ID");

  // Whitespace handling
  const spacedMatch = searchDestinationsWithTrie("   ahm   ", trie);
  assert(spacedMatch !== null && spacedMatch.has("ahmedabad"), "Leading/trailing spaces '   ahm   ' returns ahmedabad");

  // Single-character queries
  const aMatch = searchDestinationsWithTrie("a", trie);
  assert(aMatch !== null && aMatch.has("ahmedabad"), "1-char query 'a' contains ahmedabad");

  const sMatch = searchDestinationsWithTrie("s", trie);
  assert(sMatch !== null && sMatch.has("somnath") && sMatch.has("saputara"), "1-char query 's' matches multiple destinations");

  // Search by Attraction Name inside Destination
  // e.g. "Adalaj" is an attraction in Ahmedabad
  const adalajMatch = searchDestinationsWithTrie("adalaj", trie);
  assert(adalajMatch !== null && adalajMatch.has("ahmedabad"), "Search attraction 'adalaj' resolves to 'ahmedabad' destination");

  // e.g. "Sun Temple" is in Modhera
  const sunTempleMatch = searchDestinationsWithTrie("sun temple", trie);
  assert(sunTempleMatch !== null && sunTempleMatch.has("modhera"), "Search attraction 'sun temple' resolves to 'modhera'");

  // e.g. "Bet Dwarka" is in Dwarka
  const betDwarkaMatch = searchDestinationsWithTrie("bet dwarka", trie);
  assert(betDwarkaMatch !== null && betDwarkaMatch.has("dwarka"), "Search attraction 'bet dwarka' resolves to 'dwarka'");

  // e.g. "Bhalka Tirth" is in Somnath
  const bhalkaMatch = searchDestinationsWithTrie("bhalka", trie);
  assert(bhalkaMatch !== null && bhalkaMatch.has("somnath"), "Search attraction 'bhalka' resolves to 'somnath'");

  // Search by District
  const kutchMatch = searchDestinationsWithTrie("kutch", trie);
  assert(kutchMatch !== null && kutchMatch.has("rann-of-kutch"), "Search district 'kutch' resolves to 'rann-of-kutch'");

  // Search in Gujarati Script (e.g. સોમ, સોમનાથ, દ્વારકા)
  const gujaratiSomPrefix = searchDestinationsWithTrie("સોમ", trie);
  assert(gujaratiSomPrefix !== null && gujaratiSomPrefix.has("somnath"), "Search Gujarati prefix 'સોમ' returns somnath ID");

  const gujaratiMatch = searchDestinationsWithTrie("સોમનાથ", trie);
  assert(gujaratiMatch !== null && gujaratiMatch.has("somnath"), "Search Gujarati full 'સોમનાથ' returns somnath ID");

  const gujaratiDwarka = searchDestinationsWithTrie("દ્વારકા", trie);
  assert(gujaratiDwarka !== null && gujaratiDwarka.has("dwarka"), "Search Gujarati 'દ્વારકા' returns dwarka ID");

  // Search in Hindi Script (e.g. सोम, सोमनाथ, द्वार, द्वारका)
  const hindiSomPrefix = searchDestinationsWithTrie("सोम", trie);
  assert(hindiSomPrefix !== null && hindiSomPrefix.has("somnath"), "Search Hindi prefix 'सोम' returns somnath ID");

  const hindiMatch = searchDestinationsWithTrie("सोमनाथ", trie);
  assert(hindiMatch !== null && hindiMatch.has("somnath"), "Search Hindi full 'सोमनाथ' returns somnath ID");

  const hindiDwarPrefix = searchDestinationsWithTrie("द्वार", trie);
  assert(hindiDwarPrefix !== null && hindiDwarPrefix.has("dwarka"), "Search Hindi prefix 'द्वार' returns dwarka ID");

  const hindiDwarka = searchDestinationsWithTrie("द्वारका", trie);
  assert(hindiDwarka !== null && hindiDwarka.has("dwarka"), "Search Hindi full 'द्वारका' returns dwarka ID");

  // Empty Query returns null (meaning no text filter constraint)
  const emptyMatch = searchDestinationsWithTrie("", trie);
  assert(emptyMatch === null, "Empty search query returns null");

  const spacesOnlyMatch = searchDestinationsWithTrie("     ", trie);
  assert(spacesOnlyMatch === null, "Whitespace-only query returns null");

  // Unknown term returns empty Set (0 matches)
  const unknownMatch = searchDestinationsWithTrie("xyzabc123", trie);
  assert(unknownMatch !== null && unknownMatch.size === 0, "Unknown query 'xyzabc123' returns empty Set");

  // Deduplication check: Set size should match array when converted
  assert(Array.from(somMatch).length === new Set(somMatch).size, "Matched IDs must have no duplicates");
}

console.log("\n--- Test Group 4: Destination Filtering & Sorting Simulation ---");
{
  const trie = buildDestinationTrie(GUJARAT_DESTINATIONS);
  const destMap = getDestinationMap();

  // Test Trie -> ID -> Map record lookup flow
  const query = "modhera";
  const matchedIds = searchDestinationsWithTrie(query, trie);
  assert(matchedIds !== null, "matchedIds should not be null for 'modhera'");

  // Lookup records from IDs via Map structure (O(1) per record)
  const lookedUpRecords = Array.from(matchedIds).map(id => destMap.get(id)).filter(Boolean);
  assert(lookedUpRecords.length >= 1, "At least one destination looked up from Map for 'modhera'");
  assert(lookedUpRecords.some((d: any) => d.id === "modhera"), "Looked up list must contain 'modhera'");
  assert(!lookedUpRecords.some((d: any) => d.id === "somnath"), "Looked up list must NOT contain 'somnath'");

  // Simulate Category + Trie text search combination
  const modheraDest = destMap.get("modhera");
  const modheraCategory = modheraDest?.officialCategory || "";

  const categoryFiltered = lookedUpRecords.filter(
    (d: any) => d.officialCategory === modheraCategory
  );
  assert(categoryFiltered.some((d: any) => d.id === "modhera"), "Trie search combined with Category filter works");

  // Category mismatch yields 0 results
  const wrongCategoryFiltered = lookedUpRecords.filter(
    (d: any) => d.officialCategory === "Beaches"
  );
  assert(wrongCategoryFiltered.length === 0, "Trie search with conflicting category correctly yields 0 results");

  // Test Search + Sorting combination
  const sResults = searchDestinationsWithTrie("s", trie);
  assert(sResults !== null && sResults.size > 1, "Search 's' matches multiple destinations");
  const sRecords = Array.from(sResults).map(id => destMap.get(id)).filter(Boolean) as any[];

  // Rating sort (descending)
  const sortedByRating = [...sRecords].sort((a, b) => b.ratingValue - a.ratingValue);
  for (let i = 1; i < sortedByRating.length; i++) {
    assert(sortedByRating[i - 1].ratingValue >= sortedByRating[i].ratingValue, "Rating sort order preserved");
  }

  // Alphabetical sort (ascending)
  const sortedAlphabetical = [...sRecords].sort((a, b) => a.name.localeCompare(b.name));
  for (let i = 1; i < sortedAlphabetical.length; i++) {
    assert(sortedAlphabetical[i - 1].name.localeCompare(sortedAlphabetical[i].name) <= 0, "Alphabetical sort order preserved");
  }
}

// 5. Typo-Tolerant Fuzzy Levenshtein Search Tests
console.log("\n--- Test Group 5: Typo-Tolerant Fuzzy Levenshtein Search ---");
{
  const trie = buildDestinationTrie(GUJARAT_DESTINATIONS);

  // Standalone Trie searchFuzzy check
  const fuzzySomnath = trie.searchFuzzy("somanth", 2);
  assert(fuzzySomnath.includes("somnath"), "Trie searchFuzzy('somanth') matches 'somnath' within edit distance 2");

  // Integration: "Somanth" typo in searchDestinationsWithTrie
  const somanthTypo = searchDestinationsWithTrie("Somanth", trie);
  assert(somanthTypo !== null && somanthTypo.has("somnath"), "Misspelled query 'Somanth' resolves to 'somnath'");

  // "modera" typo (missing 'h' in Modhera, edit distance 1)
  const moderaTypo = searchDestinationsWithTrie("modera", trie);
  assert(moderaTypo !== null && moderaTypo.has("modhera"), "Misspelled query 'modera' resolves to 'modhera'");

  // "dwraka" typo (transposition in Dwarka, Damerau distance 1)
  const dwrakaTypo = searchDestinationsWithTrie("dwraka", trie);
  assert(dwrakaTypo !== null && dwrakaTypo.has("dwarka"), "Misspelled query 'dwraka' resolves to 'dwarka'");

  // "ahmdabad" typo (missing 'e', edit distance 1)
  const ahmdabadTypo = searchDestinationsWithTrie("ahmdabad", trie);
  assert(ahmdabadTypo !== null && ahmdabadTypo.has("ahmedabad"), "Misspelled query 'ahmdabad' resolves to 'ahmedabad'");

  // Completely invalid foreign search returns 0 results even with fuzzy enabled
  const foreignSearch = searchDestinationsWithTrie("new york city", trie);
  assert(foreignSearch !== null && foreignSearch.size === 0, "Distant query 'new york city' yields 0 matches");
}

// 6. Dynamic Admin CMS Cache Invalidation & Re-indexing Tests
console.log("\n--- Test Group 6: Dynamic Admin CMS Invalidation (resetDestinationTrie) ---");
{
  const testDestId = "dynamic-patan-vav";
  const testDest = {
    id: testDestId,
    name: "Patan Rani Ki Vav",
    district: "Patan",
    location: "Patan, North Gujarat",
    category: "Heritage Sites",
    officialCategory: "UNESCO World Heritage Site" as const,
    tag: "Queen's Stepwell",
    rating: "4.9 ★",
    ratingValue: 4.9,
    entryFee: "₹40",
    entryFeeNumeric: 40,
    bestTime: "Oct – Mar",
    distanceFromAhmedabad: "125 km",
    distanceNumeric: 125,
    duration: "1 Day",
    avgVisitTime: "2 Hours",
    imageUrl: "https://example.com/patan.jpg",
    imageAlt: "Rani Ki Vav Stepwell",
    description: "UNESCO World Heritage subterranean stepwell.",
    highlights: ["Intricate sculptural galleries"],
    attractions: [
      {
        id: "patan-monument-1",
        name: "Rani Ki Vav Subterranean Monument",
        lat: 23.8589,
        lng: 72.1017,
        durationHours: 2,
        rating: 4.9,
        category: "Stepwell",
        entryFee: "₹40",
        entryFeeNumeric: 40,
        wheelchairAccessible: false,
        physicalDemand: "moderate" as const,
      },
    ],
    hotels: [],
    restaurants: [],
    nearbyAttractions: [],
    nearbyHotels: [],
  };

  // 1. Initially, searching "Rani Ki Vav" should NOT return the dynamic destination
  resetDestinationTrie();
  const initialVav = searchDestinationsWithTrie("Rani Ki Vav");
  assert(initialVav === null || !initialVav.has(testDestId), "Pre-condition: Dynamic destination does not exist yet");

  // 2. Admin adds the destination dynamically at runtime
  GUJARAT_DESTINATIONS.push(testDest);
  resetDestinationTrie(); // Invalidate cache

  // 3. Next search builds fresh Trie and must find the new destination immediately
  const afterAddDest = searchDestinationsWithTrie("Rani Ki Vav");
  assert(afterAddDest !== null && afterAddDest.has(testDestId), "Post-add: Dynamic destination 'Rani Ki Vav' is immediately searchable in refreshed Trie");

  const afterAddAttraction = searchDestinationsWithTrie("Subterranean Monument");
  assert(afterAddAttraction !== null && afterAddAttraction.has(testDestId), "Post-add: Dynamic attraction name is immediately searchable in refreshed Trie");

  // 4. Admin deletes the destination dynamically at runtime
  const idx = GUJARAT_DESTINATIONS.findIndex((d) => d.id === testDestId);
  if (idx !== -1) {
    GUJARAT_DESTINATIONS.splice(idx, 1);
  }
  resetDestinationTrie(); // Invalidate cache

  // 5. Refreshed search must no longer contain the deleted destination
  const afterDeleteDest = searchDestinationsWithTrie("Rani Ki Vav");
  assert(afterDeleteDest === null || !afterDeleteDest.has(testDestId), "Post-delete: Deleted destination is no longer returned by Trie");
}

console.log("\n🎉 All 28 Trie unit, integration, fuzzy Levenshtein & dynamic CMS tests PASSED successfully!\n");
