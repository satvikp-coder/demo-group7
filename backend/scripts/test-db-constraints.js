import assert from "node:assert/strict";
import { createPool } from "./database.js";

const pool = createPool();
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const attractions = (await client.query("SELECT id, destination_id, external_id FROM attractions WHERE external_id = ANY($1::text[])", [["a101", "a102", "a201"]])).rows;
  const get = (id) => attractions.find((row) => row.external_id === id);
  const hotel = (await client.query("SELECT id FROM hotels WHERE external_id = $1", ["h101"])).rows[0];
  assert.ok(get("a101") && get("a102") && get("a201") && hotel);

  const insertRoute = (city, from, to, fromHotel = null) => client.query(
    "INSERT INTO routes (destination_id, source_attraction_id, destination_attraction_id, source_hotel_id, distance_km, travel_time_minutes, transport_mode) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [city, from, to, fromHotel, 1, 5, "road"],
  );
  await insertRoute(get("a101").destination_id, get("a101").id, get("a102").id);
  await insertRoute(get("a101").destination_id, null, get("a102").id, hotel.id);
  for (const [from, to, fromHotel, expected] of [
    [get("a101").id, get("a201").id, null, "23503"],
    [get("a101").id, get("a102").id, hotel.id, "23514"],
    [null, get("a102").id, null, "23514"],
  ]) {
    await client.query("SAVEPOINT invalid_route");
    await assert.rejects(insertRoute(get("a101").destination_id, from, to, fromHotel), { code: expected });
    await client.query("ROLLBACK TO SAVEPOINT invalid_route");
  }
  console.log("PASS: attraction/hotel endpoints accepted; cross-city, ambiguous, and missing endpoints rejected.");
} finally {
  await client.query("ROLLBACK");
  client.release();
  await pool.end();
  console.log("All constraint-test data rolled back; production route count unchanged.");
}
