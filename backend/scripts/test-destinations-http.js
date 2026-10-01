// Curl -> actual HTTP entry point -> PostgreSQL + imported DSA modules.
// Read-only: no fixture cities, attractions, hotels, or restaurants are inserted.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { startServer } from "../server.js";
import { pool } from "../config/database.js";
import { destinationSearchCache } from "../services/destinationSearchCache.js";

const exchanges = [];
const server = await startServer(0);
if (!server.listening) await once(server, "listening");
const baseUrl = "http://127.0.0.1:" + server.address().port;
const jsonValue = (value) => JSON.parse(JSON.stringify(value));

async function request(path, expectedStatus = 200) {
  const child = spawn(process.platform === "win32" ? "curl.exe" : "curl", [
    "--silent", "--show-error", "--globoff", "--max-time", "15",
    "--write-out", "\n%{http_code}", baseUrl + path,
  ], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const [code] = await once(child, "close");
  if (code !== 0) throw new Error("curl failed: " + stderr);
  const split = stdout.lastIndexOf("\n");
  const status = Number(stdout.slice(split + 1));
  const body = JSON.parse(stdout.slice(0, split));
  exchanges.push({ request: { method: "GET", path }, response: { status, body } });
  assert.equal(status, expectedStatus, path);
  if (status >= 400) {
    assert.equal(typeof body.error.message, "string");
    assert.equal("stack" in body, false);
  }
  return body;
}

let cacheEvidence;
try {
  const cities = (await pool.query("SELECT * FROM destinations ORDER BY name, id")).rows;
  assert.deepEqual(cities.map(c=>c.slug).sort(), ['ahmedabad','champaner','dwarka','gir-national-park','modhera','rann-of-kutch','saputara','somnath']);
  assert.deepEqual(await request("/api/destinations"), jsonValue(cities));
  assert.deepEqual(await request("/api/destinations?limit=1&offset=1"), jsonValue(cities.slice(1, 2)));
  assert.deepEqual(await request("/api/destinations?offset=999"), []);

  const city = cities.find((row) => row.slug === "ahmedabad");
  assert.ok(city);
  assert.deepEqual(await request("/api/destinations/" + city.id), jsonValue(city));
  assert.deepEqual(await request("/api/destinations/" + city.slug), jsonValue(city));

  for (const destination of cities) {
    const base = "/api/destinations/" + destination.id;
    const attractions = (await pool.query(
      "SELECT * FROM attractions WHERE destination_id = $1 ORDER BY name, id", [destination.id],
    )).rows;
    const restaurants = (await pool.query(
      "SELECT * FROM restaurants WHERE destination_id = $1 ORDER BY name, id", [destination.id],
    )).rows;
    assert.deepEqual(await request(base + "/attractions"), jsonValue(attractions));
    assert.deepEqual(await request(base + "/restaurants"), jsonValue(restaurants));
    assert.deepEqual(await request(base + "/attractions?offset=999"), []);
    assert.deepEqual(await request(base + "/restaurants?offset=999"), []);
    assert.deepEqual(await request(base + "/hotels?offset=999"), []);

    // SQL is an independent ordering oracle for the endpoint's DSA Merge Sort.
    const priceOrder = (await pool.query(
      "SELECT * FROM hotels WHERE destination_id = $1 ORDER BY price_per_night ASC, name, id",
      [destination.id],
    )).rows;
    const ratingOrder = (await pool.query(
      "SELECT * FROM hotels WHERE destination_id = $1 ORDER BY rating DESC NULLS LAST, name, id",
      [destination.id],
    )).rows;
    const nameOrder = (await pool.query(
      "SELECT * FROM hotels WHERE destination_id = $1 ORDER BY name, id", [destination.id],
    )).rows;
    assert.deepEqual(await request(base + "/hotels?sort=price"), jsonValue(priceOrder));
    assert.deepEqual(await request(base + "/hotels?sort=rating"), jsonValue(ratingOrder));
    assert.deepEqual(await request(base + "/hotels?sort=name"), jsonValue(nameOrder));
    assert.deepEqual(await request(base + "/hotels?sort=rating&limit=1&offset=1"), jsonValue(ratingOrder.slice(1, 2)));
  }

  const before = destinationSearchCache.getStatus();
  const originalQuery = pool.query;
  let searchDatabaseCalls = 0;
  pool.query = function (...args) {
    searchDatabaseCalls++;
    return originalQuery.apply(this, args);
  };
  try {
    const somnath = cities.find((row) => row.slug === "somnath");
    assert.deepEqual(await request("/api/destinations/search?prefix=Som"), jsonValue([somnath]));
    assert.deepEqual(await request("/api/destinations/search?prefix=sOM"), jsonValue([somnath]));
    assert.deepEqual(await request("/api/destinations/search?prefix=Sabarmati"), jsonValue([city]));
    assert.deepEqual(await request("/api/destinations/search?prefix=Adalaj"), jsonValue([city]));
    assert.deepEqual(await request("/api/destinations/search?prefix=nath"), []);
    assert.deepEqual(await request("/api/destinations/search?prefix=zzzz-no-real-match"), []);
    assert.deepEqual(await request("/api/destinations/search?prefix=Som&offset=999"), []);
    assert.deepEqual(await request("/api/destinations/search?prefix=" + encodeURIComponent("' OR 1=1 --")), []);
  } finally {
    pool.query = originalQuery;
  }
  const after = destinationSearchCache.getStatus();
  assert.equal(after.generation, before.generation);
  assert.equal(searchDatabaseCalls, 0);
  cacheEvidence = { before, after, searchDatabaseCalls };

  for (const path of [
    "/api/destinations?limit=0",
    "/api/destinations?limit=101",
    "/api/destinations?limit=1&limit=2",
    "/api/destinations?unexpected=true",
    "/api/destinations/search",
    "/api/destinations/search?prefix=",
    "/api/destinations/search?prefix=A&prefix=B",
    "/api/destinations/search?prefix=" + "a".repeat(101),
    "/api/destinations/" + city.id + "?unexpected=true",
    "/api/destinations/" + city.id + "/hotels?sort=invalid",
    "/api/destinations/" + city.id + "/hotels?limit=0",
    "/api/destinations/" + city.id + "/attractions?offset=-1",
    "/api/destinations/" + city.id + "/restaurants?limit=garbage",
    "/api/destinations/" + encodeURIComponent("' OR 1=1 --"),
    "/api/destinations/%E0%A4%A",
  ]) await request(path, 400);

  const missingId = randomUUID();
  for (const ending of ["", "/attractions", "/hotels", "/restaurants"]) {
    assert.deepEqual(await request("/api/destinations/" + missingId + ending, 404),
      { error: { message: "Destination not found" } });
  }
  assert.deepEqual(await request("/api/destinations/gir", 404), { error: { message: "Destination not found" } });

  // Verify refresh against the unchanged real DB, not a mock dataset.
  await destinationSearchCache.refresh();
  assert.equal(destinationSearchCache.getStatus().generation, after.generation + 1);
  assert.deepEqual(await request("/api/destinations/search?prefix=Sabarmati"), jsonValue([city]));

  await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
  await writeFile(new URL("../reports/destinations-http-report.json", import.meta.url),
    JSON.stringify({
      verified: true, generatedAt: new Date().toISOString(), baseUrl, client: "curl",
      backend: "real seeded PostgreSQL; read-only checks; SQL response and ordering comparisons",
      cacheEvidence, exchanges,
    }, null, 2) + "\n");
  console.table(exchanges.map((entry) => ({
    path: entry.request.path, status: entry.response.status,
    rows: Array.isArray(entry.response.body) ? entry.response.body.length : "-",
  })));
  console.log("All direct destination curl checks passed; report: backend/reports/destinations-http-report.json");
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await destinationSearchCache.stop();
  await pool.end();
}
