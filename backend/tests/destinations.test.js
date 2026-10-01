import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";

process.env.DATABASE_URL = "postgresql://localhost:1/unused_test_database";
process.env.JWT_SECRET = randomBytes(48).toString("hex");
process.env.PORT = "5000";
process.env.CORS_ORIGIN = "http://localhost:5173";

const { DestinationSearchCache } = await import("../services/destinationSearchCache.js");
const { sortHotels } = await import("../services/hotelRanking.js");
const { searchQuery, hotelQuery, destinationParams } = await import("../middleware/validationSchemas.js");

test("Trie cache indexes DB-provided attraction names and enforces actual prefixes", async () => {
  const destination = { id: randomUUID(), name: "Database City", slug: "database-city",
    indexed_attraction_names: [["Ancient Stepwell", null, null]] };
  let reads = 0;
  const cache = new DestinationSearchCache({ loadRows: async () => { reads++; return [destination]; } });
  assert.throws(() => cache.search("Anc"), { status: 503 });
  await cache.refresh();
  assert.equal(cache.search("  ANCIENT   S ")[0].id, destination.id);
  assert.equal(cache.search("data")[0].id, destination.id);
  assert.deepEqual(cache.search("cient"), []);
  assert.deepEqual(cache.search("missing"), []);
  assert.equal(cache.search("Anc")[0].indexed_attraction_names, undefined);
  assert.equal(reads, 1, "search requests must never rebuild the index");
});

test("concurrent refreshes coalesce; errors preserve the real snapshot; empty DB clears it", async () => {
  let complete;
  let calls = 0;
  const cache = new DestinationSearchCache({
    loadRows: () => { calls++; return new Promise((resolve) => { complete = resolve; }); },
  });
  const first = cache.refresh();
  const second = cache.refresh();
  assert.equal(first, second);
  complete([{ id: randomUUID(), name: "Original", indexed_attraction_names: [] }]);
  await first;
  assert.equal(calls, 1);
  cache.loadRows = async () => { throw new Error("database unavailable"); };
  await assert.rejects(cache.refresh(), /database unavailable/);
  assert.equal(cache.search("Ori").length, 1);
  cache.loadRows = async () => [];
  await cache.refresh();
  assert.deepEqual(cache.search("Ori"), []);
});

test("cache refresh timer starts once and can be stopped", async () => {
  let reads = 0;
  let onSecondRead;
  const secondRead = new Promise((resolve) => { onSecondRead = resolve; });
  const cache = new DestinationSearchCache({ refreshIntervalMs: 10, loadRows: async () => {
    reads++;
    if (reads === 2) onSecondRead();
    return [];
  } });
  await cache.start();
  const generation = cache.generation;
  await cache.start();
  assert.equal(cache.generation, generation);
  const keepAlive = setTimeout(() => onSecondRead(), 1000);
  try {
    await secondRead;
    assert.ok(reads >= 2, "timer must refresh without an HTTP request");
  } finally {
    clearTimeout(keepAlive);
    await cache.stop();
  }
  assert.equal(cache.timer, null);
});

test("hotel Merge Sort uses numeric prices/ratings, nulls last, and deterministic ties", () => {
  const hotels = [
    { id: "c", name: "C", price_per_night: "100", rating: null },
    { id: "b", name: "B", price_per_night: "20", rating: "4.9" },
    { id: "a", name: "A", price_per_night: "20", rating: "4.9" },
  ];
  assert.deepEqual(sortHotels(hotels, "price").map((row) => row.id), ["a", "b", "c"]);
  assert.deepEqual(sortHotels(hotels, "rating").map((row) => row.id), ["a", "b", "c"]);
  assert.deepEqual(sortHotels(hotels, "name").map((row) => row.id), ["a", "b", "c"]);
  assert.deepEqual(hotels.map((row) => row.id), ["c", "b", "a"], "input is not mutated");
  assert.deepEqual(sortHotels([], "price"), []);
});

test("query validation rejects blank/array prefixes, unsupported sorts, and invalid pagination", () => {
  for (const input of [{}, { prefix: "" }, { prefix: ["A", "B"] }, { prefix: "A", limit: ["2"] }]) {
    assert.equal(searchQuery.safeParse(input).success, false);
  }
  for (const input of [{ sort: "invalid" }, { limit: "0" }, { offset: "-1" }, { offset: "2147483648" }, { limit: "1e2" }]) {
    assert.equal(hotelQuery.safeParse(input).success, false);
  }
  assert.equal(destinationParams.safeParse({ id: "' OR 1=1 --" }).success, false);
  assert.equal(destinationParams.safeParse({ id: "ahmedabad" }).success, true);
  assert.deepEqual(hotelQuery.parse({ sort: "rating", limit: "1" }), { sort: "rating", limit: 1, offset: 0 });
});


test("value ranking uses persisted scores with unknown scores last", () => {
  const hotels = [
    { id: "unknown", name: "A", value_score: null },
    { id: "low", name: "B", value_score: "2" },
    { id: "high", name: "C", value_score: "10" },
  ];
  assert.deepEqual(sortHotels(hotels, "value").map(row => row.id), ["high", "low", "unknown"]);
  assert.equal(hotelQuery.parse({ sort: "value" }).sort, "value");
});
