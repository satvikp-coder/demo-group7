import test from "node:test";
import assert from "node:assert/strict";
import { loadSources, parseSource, headers, numericEntryFee, syntheticSource } from "../scripts/csvSource.js";

test("only the 24 approved CSV entities are accepted; all simulated routes are excluded", async () => {
  const { datasets } = await loadSources();
  assert.equal(datasets["attractions.csv"].accepted.length, 14);
  assert.equal(datasets["hotels.csv"].accepted.length, 5);
  assert.equal(datasets["restaurants.csv"].accepted.length, 5);
  assert.equal(datasets["routes.csv"].raw.length, 56);
  assert.equal(datasets["routes.csv"].accepted.length, 0);
  assert.equal(datasets["routes.csv"].rejected.length, 56);
  assert.equal(datasets["routes.csv"].raw[0].source_date, "2026-08-25");
  const cities = new Set(Object.values(datasets).flatMap((data) => data.accepted.map((row) => row.destination_id)));
  assert.deepEqual([...cities].sort(), ["ahmedabad", "dwarka", "somnath"]);
});

test("CSV parser handles quoted commas and rejects unexpected extra columns", () => {
  const header = headers["routes.csv"].join(",");
  const row = 'a1,a2,somnath,1,5,"Source, with comma"';
  assert.equal(parseSource(header + "\n" + row, "routes.csv")[0].source, "Source, with comma");
  assert.throws(() => parseSource(header + "\n" + row + ",unexpected", "routes.csv"), /invalid field count/);
});

test("fares are not misclassified as entry fees; synthetic source labels are rejected", () => {
  assert.equal(numericEntryFee("Free (Prior Booking)"), 0);
  assert.equal(numericEntryFee("₹25"), 25);
  assert.equal(numericEntryFee("~₹30 boat fare"), null);
  assert.equal(syntheticSource("Simulated OpenRouteService Route (No API Key)"), true);
  assert.equal(syntheticSource("placeholder"), true);
});
