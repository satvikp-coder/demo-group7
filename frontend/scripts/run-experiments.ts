import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { pool } from '../../backend/config/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.local', import.meta.url), quiet: true });
const base = (process.env.API_TEST_URL || process.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
if (!base) throw new Error('Set API_TEST_URL or VITE_API_BASE_URL to the running backend /api URL');
const directory = new URL('../../docs/research/', import.meta.url);
const resultFile = new URL('experiment_results.json', directory);
const previousFile = new URL('experiment_results.previous-client.json', directory);
const previousPlan = new URL('Research_Experiment_Plan.previous-client.md', directory);
if (!fs.existsSync(previousFile)) fs.copyFileSync(resultFile, previousFile, fs.constants.COPYFILE_EXCL);
if (!fs.existsSync(previousPlan)) fs.copyFileSync(new URL('Research_Experiment_Plan.md', directory), previousPlan, fs.constants.COPYFILE_EXCL);
const previous = JSON.parse(fs.readFileSync(previousFile, 'utf8'));
const previousBackendFile = new URL('experiment_results.previous-backend.json', directory);
const previousBackend = fs.existsSync(previousBackendFile) ? JSON.parse(fs.readFileSync(previousBackendFile, 'utf8')) : null;
type Strategy = 'distance-first' | 'budget-first' | 'rating-first';
type Row = { experimentId: string; cityId: string; days: number; budget: number; strategy: Strategy; [key: string]: unknown };
const results: Row[] = [];
const exchanges: { method: string; path: string; status: number }[] = [];
let token = '';
let userId: string | undefined;
let cleanupCompleted = false;
async function request(method: string, path: string, body?: unknown) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  exchanges.push({ method, path, status: response.status });
  const data = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
}
const summary = (rows: Row[]) => ({
  scenarios: rows.length,
  successfulGenerations: rows.filter(r => r.status === undefined || r.status === 'generated').length,
  failures: rows.filter(r => r.status === 'failed').length,
  budgetCompliant: rows.filter(r => typeof r.totalCost === 'number' && r.totalCost <= r.budget).length,
  attractionsVisited: rows.reduce((sum, r) => sum + (typeof r.attractionsVisited === 'number' ? r.attractionsVisited : 0), 0),
  totalCost: rows.reduce((sum, r) => sum + (typeof r.totalCost === 'number' ? r.totalCost : 0), 0),
});
try {
  const credentials = { email: `experiment-${randomBytes(12).toString('hex')}@example.test`, password: 'Aa9!' + randomBytes(24).toString('hex') };
  const registered = await request('POST', '/auth/register', { ...credentials, name: 'Temporary experiment user', role: 'tourist' });
  userId = registered.user.id;
  token = (await request('POST', '/auth/login', credentials)).token;
  for (const city of [{ id: 'somnath', hotel: 'Premier Somnath' }, { id: 'dwarka', hotel: 'Hotel Darshan Palace' }]) {
    const destination = await request('GET', '/destinations/' + city.id);
    const hotels = await request('GET', `/destinations/${destination.id}/hotels?sort=price`);
    const hotel = hotels.find((h: {name: string}) => h.name.toLowerCase() === city.hotel.toLowerCase());
    const cases: Row[] = [
      ...[1,2,3].map(days => ({ experimentId: 'EXP-1-DURATION', cityId: city.id, days, budget: 10000, strategy: 'distance-first' as Strategy })),
      ...[500,900,1200,1500,3000].map(budget => ({ experimentId: 'EXP-2-BUDGET', cityId: city.id, days: 1, budget, strategy: 'distance-first' as Strategy })),
      ...(['budget-first','rating-first','distance-first'] as Strategy[]).map(strategy => ({ experimentId: 'EXP-3-STRATEGY', cityId: city.id, days: 2, budget: 10000, strategy })),
    ];
    for (const config of cases) {
      try {
        if (!hotel) throw new Error(`REAL DATA COLLECTION REQUIRED: original base hotel ${city.hotel} missing`);
        const created = await request('POST', '/trips', { destination_id: destination.id, days: config.days, budget: config.budget, starting_hotel_id: hotel.id, start_time: '08:00', strategy: config.strategy, wheelchair_accessible_only: false });
        const start = performance.now();
        const generated = await request('POST', `/trips/${created.trip.id}/generate-itinerary`, {});
        const generationRequestTimeMs = performance.now() - start;
        const persisted = await request('GET', `/trips/${created.trip.id}`);
        const budget = await request('GET', `/trips/${created.trip.id}/budget`);
        if (JSON.stringify(generated) !== JSON.stringify(persisted)) throw new Error('Fresh persisted GET differs from generated response');
        if (JSON.stringify(budget) !== JSON.stringify(persisted.budget)) throw new Error('Budget GET differs from persisted trip budget');
        const plan = persisted.trip.generation_summary;
        const stops = persisted.days.flatMap((d: {stops: {stop_type: string; reference_id: string}[]}) => d.stops);
        const attractionStops = stops.filter((s: {stop_type: string}) => s.stop_type === 'attraction');
        // Backend does not persist leg transport modes or algorithm-only timings.
        // Null preserves an unavailable metric rather than inventing a road/boat split.
        results.push({ ...config, status: 'generated', tripId: created.trip.id, hotelId: hotel.id,
          attractionsVisited: attractionStops.length, totalCost: budget.total,
          roadDistanceKm: null, boatDistanceKm: null,
          totalDistanceKm: plan.legs.reduce((sum: number, leg: {distance_km: number}) => sum + leg.distance_km, 0),
          dijkstraFallbacks: plan.routing.dijkstra_calls, executionTimeMs: null, generationRequestTimeMs,
          budgetCompliant: !budget.over_budget, hotelBudgetCompliant: !budget.hotel_over_budget,
          generationStatus: plan.status, warnings: plan.warnings, routeRows: plan.route_rows,
          persistedResultMatches: true, uniqueAttractions: new Set(attractionStops.map((s: {reference_id: string}) => s.reference_id)).size === attractionStops.length,
          circularDays: persisted.days.every((d: {stops: {reference_id: string}[]}) => d.stops[0]?.reference_id === hotel.id && d.stops.at(-1)?.reference_id === hotel.id),
          budgetResponse: budget, generationSummary: plan });
      } catch (error) {
        results.push({ ...config, status: 'failed', error: error instanceof Error ? error.message : String(error) });
        process.exitCode = 1;
      }
    }
  }
} finally {
  // No application delete endpoint exists. Delete only this exact temporary owner;
  // PostgreSQL cascades its experiment trips, stops and budget snapshots.
  if (userId) {
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    const remaining = await pool.query('SELECT id FROM trips WHERE user_id=$1', [userId]);
    cleanupCompleted = remaining.rowCount === 0;
  }
  await pool.end();
  results.sort((a,b) => a.experimentId.localeCompare(b.experimentId) || b.cityId.localeCompare(a.cityId));
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2) + '\n');
  const comparison = { checkedAt: new Date().toISOString(), path: 'HTTP -> Express -> PostgreSQL persisted generation', previous: summary(previous), previousBackend: previousBackend ? summary(previousBackend) : null, current: summary(results), cleanupCompleted, exchanges,
    limitations: ['Historical baseline is retained client output, not independently reverified tourism facts.', 'Road/boat split and algorithm-only execution time unavailable in backend contract; null, not zero.', 'HTTP generation latency includes network/database persistence and is not comparable to old CPU time.', 'Road routes are sourced snapshots; fares, calendar closures, split opening hours and fixed booking availability are not fully represented. HTTP generation alone does not certify a complete tourism itinerary.'] };
  fs.writeFileSync(new URL('experiment_comparison.json', directory), JSON.stringify(comparison, null, 2) + '\n');
  fs.writeFileSync(new URL('Research_Experiment_Plan.md', directory), `# Backend-driven experiment verification\n\nRun: ${comparison.checkedAt}\n\nOriginal 22 Somnath/Dwarka duration, budget and strategy scenarios retained, with the same named base hotels and 08:00 start. Uses registration/login, POST trips, POST generation, fresh GET trip and GET budget. Real database records only. No client planner imports. Prior report preserved in Research_Experiment_Plan.previous-client.md.\n\n${comparison.limitations.join('\n\n')}\n\n| Run | Scenarios | Generated | Failed | Within budget | Attraction visits | Total cost |\n|---|---:|---:|---:|---:|---:|---:|\n${[ ['Previous client', comparison.previous], ...(comparison.previousBackend ? [['Previous backend', comparison.previousBackend]] : []), ['Current backend', comparison.current] ].map(([label,s]) => { const v = s as ReturnType<typeof summary>; return `| ${label} | ${v.scenarios} | ${v.successfulGenerations} | ${v.failures} | ${v.budgetCompliant} | ${v.attractionsVisited} | ${v.totalCost} |`; }).join('\n')}\n\nDetailed per-scenario values, flags and persisted IDs are in experiment_results.json. All temporary experiment records cleaned: ${cleanupCompleted}.\n`);
  console.log(JSON.stringify(comparison, null, 2));
}
