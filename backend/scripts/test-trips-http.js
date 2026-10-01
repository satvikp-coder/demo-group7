// curl -> real Express -> real PostgreSQL. Temporary fixture rows are explicitly
// labeled synthetic and removed by exact IDs; approved catalog rows are never edited.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { startServer } from "../server.js";
import { destinationSearchCache } from "../services/destinationSearchCache.js";
import { pool } from "../config/database.js";

const exchanges = [];
const cases = {};
const userIds = [];
const fixtureCity = randomUUID();
const fixtureSource = "Synthetic temporary trip HTTP test fixture; not verified tourism data";
let server, baseUrl, verified = false, cleanupCompleted = false;
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) =>
    [key, ["password", "token", "password_hash"].includes(key) ? "[redacted]" : redact(item)]));
}
async function request(method, path, body, token, expected = 200) {
  const args = ["--silent", "--show-error", "--max-time", "30", "--request", method,
    "--write-out", "\n%{http_code}", baseUrl + path];
  if (body !== undefined) args.push("--header", "Content-Type: application/json", "--data-binary", "@-");
  if (token) args.push("--header", "Authorization: Bearer " + token);
  const child = spawn(process.platform === "win32" ? "curl.exe" : "curl", args,
    { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
  let output = "", error = "";
  child.stdout.on("data", data => { output += data; });
  child.stderr.on("data", data => { error += data; });
  child.stdin.end(body === undefined ? undefined : JSON.stringify(body));
  const [code] = await once(child, "close");
  assert.equal(code, 0, error);
  const split = output.lastIndexOf("\n");
  const status = Number(output.slice(split + 1));
  const json = JSON.parse(output.slice(0, split));
  exchanges.push({ request: { method, path, body: redact(body),
    ...(token ? { authorization: "Bearer [redacted]" } : {}) }, response: { status, body: redact(json) } });
  assert.equal(status, expected, `${method} ${path}: ${JSON.stringify(json)}`);
  return json;
}
async function login() {
  const email = `trips-${randomUUID()}@example.test`;
  const password = "Aa1!" + randomBytes(24).toString("hex");
  const registered = await request("POST", "/api/auth/register",
    { name: "Trip HTTP verification", email, password, role: "tourist" }, undefined, 201);
  userIds.push(registered.user.id);
  return (await request("POST", "/api/auth/login", { email, password })).token;
}
async function flow(label, input, token) {
  const created = await request("POST", "/api/trips", input, token, 201);
  const path = "/api/trips/" + created.trip.id;
  const generated = await request("POST", path + "/generate-itinerary", {}, token);
  const fetched = await request("GET", path, undefined, token);
  const budget = await request("GET", path + "/budget", undefined, token);
  assert.deepEqual(fetched, generated);
  assert.deepEqual(budget, generated.budget);
  const stored = (await pool.query("SELECT * FROM itinerary_stops WHERE trip_id=$1 ORDER BY day_number,stop_order", [created.trip.id])).rows;
  assert.deepEqual(JSON.parse(JSON.stringify(stored)), fetched.days.flatMap(day => day.stops));
  const totals = (await pool.query(`SELECT
    COALESCE(SUM(cost),0)::float8 AS total,
    COALESCE(SUM(cost) FILTER(WHERE stop_type='hotel'),0)::float8 AS hotel,
    COALESCE(SUM(cost) FILTER(WHERE stop_type='attraction'),0)::float8 AS attractions,
    COALESCE(SUM(cost) FILTER(WHERE stop_type='meal'),0)::float8 AS meals
    FROM itinerary_stops WHERE trip_id=$1`, [created.trip.id])).rows[0];
  for (const key of Object.keys(totals)) assert.equal(budget[key], totals[key]);
  assert.equal(budget.remaining, input.budget - totals.total);
  for (const day of fetched.days) {
    assert.equal(day.stops[0].reference_id, input.starting_hotel_id);
    assert.equal(day.stops.at(-1).reference_id, input.starting_hotel_id);
    let last = "00:00:00";
    for (const stop of day.stops) {
      assert.ok(stop.arrival_time >= last);
      assert.ok(stop.departure_time >= stop.arrival_time);
      last = stop.departure_time;
    }
  }
  cases[label] = { trip_id: created.trip.id, create: created,
    summary: generated.trip.generation_summary, budget, persisted_stop_count: stored.length };
  return { path, created, generated, fetched, budget };
}
try {
  server = await startServer(0);
  if (!server.listening) await once(server, "listening");
  baseUrl = "http://127.0.0.1:" + server.address().port;
  const token = await login();
  const otherToken = await login();
  const catalogHotel = (await pool.query("SELECT * FROM hotels ORDER BY price_per_night DESC,id LIMIT 1")).rows[0];
  assert.ok(catalogHotel, "Seeded catalog hotel required");
  const catalogInput = { destination_id: catalogHotel.destination_id, days: 1, budget: 100,
    starting_hotel_id: catalogHotel.id, start_time: "08:00", wheelchair_accessible_only: true };
  const catalog = await flow("existing_catalog", catalogInput, token);
  assert.equal(catalog.created.hotel_over_budget, true);
  assert.equal(catalog.created.hotel_replaced, false);
  assert.equal(catalog.budget.hotel, catalogHotel.price_per_night);

  await pool.query("INSERT INTO destinations(id,slug,name) VALUES($1,$2,$3)",
    [fixtureCity, "trip-test-" + fixtureCity, "Temporary trip test " + fixtureCity]);
  const hotel = randomUUID(), cheaperHotel = randomUUID(), restaurant = randomUUID();
  for (const [id, name, price] of [[hotel, "Fixture selected hotel", 1000], [cheaperHotel, "Fixture cheaper hotel", 50]]) {
    await pool.query(`INSERT INTO hotels(id,destination_id,name,lat,lng,price_per_night,stay_type,source)
      VALUES($1,$2,$3,23,72,$4,'Registered Hotel',$5)`, [id, fixtureCity, name, price, fixtureSource]);
  }
  await pool.query(`INSERT INTO restaurants(id,destination_id,name,lat,lng,avg_cost_per_person,source)
    VALUES($1,$2,'Fixture restaurant',23,72,100,$3)`, [restaurant,fixtureCity,fixtureSource]);
  const a = randomUUID(), b = randomUUID(), c = randomUUID(), inaccessible = randomUUID(), unknown = randomUUID();
  for (const [id,name,accessible] of [[a,"Fixture accessible A",true],[b,"Fixture accessible B",true],
    [c,"Fixture accessible C",true],[inaccessible,"Fixture stairs-only",false],[unknown,"Fixture unknown access",null]]) {
    await pool.query(`INSERT INTO attractions(id,destination_id,name,lat,lng,duration_hours,rating,category,
      entry_fee_numeric,wheelchair_accessible,source) VALUES($1,$2,$3,23,72,1,4.5,'test',50,$4,$5)`,
      [id,fixtureCity,name,accessible,fixtureSource]);
  }
  async function route(fromType,from,toType,to,distance) {
    const columns = { attraction:"attraction_id",hotel:"hotel_id",restaurant:"restaurant_id" };
    await pool.query(`INSERT INTO routes(destination_id,source_${columns[fromType]},destination_${columns[toType]},
      distance_km,travel_time_minutes,transport_mode,source) VALUES($1,$2,$3,$4,5,'road',$5)`,
      [fixtureCity,from,to,distance,fixtureSource]);
  }
  for (const [id,distance] of [[a,1],[b,2],[c,9],[inaccessible,0.5],[unknown,0.6]]) {
    await route("hotel",hotel,"attraction",id,distance);
    await route("attraction",id,"restaurant",restaurant,20);
  }
  await route("attraction",a,"attraction",c,10);
  await route("attraction",b,"attraction",c,1);
  await route("attraction",inaccessible,"attraction",a,0.2);
  await route("hotel",hotel,"restaurant",restaurant,20);
  const input = { destination_id: fixtureCity, days: 1, budget: 5000,
    starting_hotel_id: hotel, start_time: "08:00" };
  const unrestricted = await flow("fixture_unrestricted", input, token);
  assert.ok(unrestricted.fetched.days.flatMap(d=>d.stops).some(s=>s.reference_id===inaccessible));
  const accessible = await flow("fixture_accessible", {...input,wheelchair_accessible_only:true}, token);
  const summary = accessible.fetched.trip.generation_summary;
  const attractionStops = accessible.fetched.days.flatMap(d=>d.stops).filter(s=>s.stop_type==="attraction");
  assert.deepEqual(attractionStops.map(s=>s.reference_id), [a,b,c]);
  assert.ok(attractionStops.every(s=>s.wheelchair_accessible===true));
  assert.ok(summary.excluded_attractions.some(s=>s.id===inaccessible && s.reason==="not_wheelchair_accessible"));
  assert.ok(summary.excluded_attractions.some(s=>s.id===unknown && s.reason==="accessibility_unknown"));
  assert.ok(summary.legs.some(l=>l.from===a && l.to===b && l.method==="dijkstra"));
  assert.ok(summary.legs.some(l=>l.from===b && l.to===c && l.method==="direct"));
  assert.equal(accessible.budget.total, 1350);
  assert.equal(accessible.budget.meals, 200);
  for (const leg of summary.legs) {
    assert.ok(!leg.path.includes(inaccessible) && !leg.path.includes(unknown));
  }
  const overBudget = await flow("fixture_over_budget", {...input,budget:100}, token);
  assert.equal(overBudget.created.hotel_over_budget,true);
  assert.equal(overBudget.created.trip.starting_hotel_id,hotel);
  assert.equal(overBudget.budget.hotel,1000);
  assert.equal(overBudget.budget.over_budget,true);
  assert.equal(overBudget.budget.total,1000);
  assert.equal(overBudget.fetched.trip.generation_summary.hotel_replaced,false);
  const multiDay = await flow("fixture_two_days", {...input,days:2,wheelchair_accessible_only:true},token);
  assert.equal(multiDay.budget.hotel,2000);
  assert.equal(multiDay.budget.meals,400);
  assert.equal(multiDay.budget.attractions,150);
  const regenerated = await request("POST",accessible.path+"/generate-itinerary",{},token);
  assert.equal(regenerated.days.flatMap(d=>d.stops).length,accessible.fetched.days.flatMap(d=>d.stops).length);
  assert.deepEqual(regenerated.budget,accessible.budget);
  const concurrent = await Promise.allSettled(Array.from({length:4}, () =>
    request("POST",accessible.path+"/generate-itinerary",{},token)));
  for (const result of concurrent) {
    assert.equal(result.status,"fulfilled",result.reason?.message);
    assert.deepEqual(result.value.budget,accessible.budget);
    assert.equal(result.value.days.flatMap(d=>d.stops).length,accessible.fetched.days.flatMap(d=>d.stops).length);
  }
  cases.concurrent_regeneration = {requests:4,allSucceeded:true,noDuplicateStops:true};
  const late = await flow("fixture_late_start",{...input,start_time:"21:59"},token);
  assert.equal(late.budget.meals,0);
  for (const suffix of ["", "/budget"]) {
    await request("GET",accessible.path+suffix,undefined,otherToken,404);
    await request("GET",accessible.path+suffix,undefined,undefined,401);
  }
  await request("POST",accessible.path+"/generate-itinerary",{},otherToken,404);
  await request("POST","/api/trips",input,undefined,401);
  await request("POST","/api/trips",{...input,days:0},token,400);
  await request("POST","/api/trips",{...input,starting_hotel_id:catalogHotel.id},token,422);
  const listed=await request('GET','/api/trips?limit=100&offset=0',undefined,token);
  assert.ok(listed.some(t=>t.id===accessible.created.trip.id));
  assert.deepEqual(await request('GET','/api/trips?limit=100&offset=0',undefined,otherToken),[]);
  await request('GET','/api/trips?limit=101',undefined,token,400);
  await request('GET','/api/trips',undefined,undefined,401);
  cases.persisted_account_ledger={ownedList:true,otherAccountExcluded:true,paginationValidated:true,unauthenticatedRejected:true};
  verified = true;
} finally {
  // Only rows belonging to this run; cascading trip/stop cleanup precedes catalog cleanup.
  for (const id of userIds) await pool.query("DELETE FROM users WHERE id=$1",[id]);
  await pool.query("DELETE FROM destinations WHERE id=$1",[fixtureCity]);
  cleanupCompleted = true;
  await destinationSearchCache.stop();
  if (server) await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  await mkdir(new URL("../reports/",import.meta.url),{recursive:true});
  await writeFile(new URL("../reports/trips-http-report.json",import.meta.url),JSON.stringify({
    verified,generatedAt:new Date().toISOString(),client:"curl",baseUrl,
    evidence:"Real PostgreSQL. existing_catalog uses preserved approved records; fixture_* cases use temporary synthetic rows, never represented as verified route data.",
    cleanupCompleted,cases,exchanges,
  },null,2)+"\n");
  await pool.end();
}
console.log(JSON.stringify({verified,cleanupCompleted,cases:Object.fromEntries(Object.entries(cases).map(([name,c])=>
  [name,c.budget ? {trip_id:c.trip_id,total:c.budget.total,stops:c.persisted_stop_count,hotel_over_budget:c.budget.hotel_over_budget} : c]))},null,2));
