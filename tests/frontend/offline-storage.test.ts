import assert from 'node:assert/strict';
import {test, beforeEach} from 'node:test';
import {clearOfflineTrips, getLatestOfflineTrip, getOfflineTripByTripId, removeTripFromOfflineCache, saveTripToOfflineCache} from '../../frontend/src/utils/offlineStorage';

// Minimal in-memory localStorage for node.
const store = new Map<string, string>();
const g = globalThis as unknown as Record<string, unknown>;
g.localStorage = {getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, String(v)), removeItem: (k: string) => void store.delete(k)};
beforeEach(() => store.clear());

const config = (tripId: string, cityId = 'somnath') => ({tripId, cityId, tripDays: 2, budget: 20000, strategy: 'distance-first'}) as never;
const result = (name = 'Somnath', extra: Record<string, unknown> = {}) => ({activeCity: {name}, totalCost: 100, ...extra}) as never;
const dto = (id: string) => ({trip: {id, trip_days: 2}, days: [], budget: {total: 100}});

test('a saved trip is found again by its server trip id, with its API copy', () => {
  saveTripToOfflineCache(config('t-1'), result(), dto('t-1'));
  const found = getOfflineTripByTripId('t-1');
  assert.equal(found?.config.tripId, 't-1');
  assert.deepEqual(found?.dto, dto('t-1'));
  assert.equal(getOfflineTripByTripId('missing'), null);
  assert.equal(getOfflineTripByTripId(''), null);
});

test('two trips with identical settings are both kept', () => {
  saveTripToOfflineCache(config('t-1'), result('Somnath'), dto('t-1'));
  saveTripToOfflineCache(config('t-2'), result('Somnath'), dto('t-2'));
  assert.equal(getOfflineTripByTripId('t-1')?.dto && (getOfflineTripByTripId('t-1')!.dto as {trip: {id: string}}).trip.id, 't-1');
  assert.equal((getOfflineTripByTripId('t-2')!.dto as {trip: {id: string}}).trip.id, 't-2');
  assert.equal(getLatestOfflineTrip()?.config.tripId, 't-2');
});

test('"not available" numbers survive storage as NaN, not null', () => {
  saveTripToOfflineCache(config('t-1'), result('Somnath', {stats: {executionTimeMs: Number.NaN, edgesRelaxed: Number.NaN, big: Infinity, ok: 7}}), dto('t-1'));
  const stats = (getOfflineTripByTripId('t-1')!.result as unknown as {stats: Record<string, number>}).stats;
  assert.ok(Number.isNaN(stats.executionTimeMs) && Number.isNaN(stats.edgesRelaxed));
  assert.equal(stats.big, Infinity);
  assert.equal(stats.ok, 7);
});

test('only the 10 most recent trips are kept', () => {
  for (let i = 1; i <= 12; i++) saveTripToOfflineCache(config(`t-${i}`), result(), dto(`t-${i}`));
  assert.equal(getOfflineTripByTripId('t-1'), null);
  assert.equal(getOfflineTripByTripId('t-2'), null);
  assert.ok(getOfflineTripByTripId('t-3') && getOfflineTripByTripId('t-12'));
});

test('deleting a trip removes only its copy, and logout clears every copy', () => {
  saveTripToOfflineCache(config('t-1'), result(), dto('t-1'));
  saveTripToOfflineCache(config('t-2'), result(), dto('t-2'));
  removeTripFromOfflineCache('t-1');
  assert.equal(getOfflineTripByTripId('t-1'), null);
  assert.ok(getOfflineTripByTripId('t-2'));
  clearOfflineTrips();
  assert.equal(getOfflineTripByTripId('t-2'), null);
  assert.equal(getLatestOfflineTrip(), null);
  assert.equal(store.size, 0);
});

test('a storage failure is swallowed so the live itinerary still works', () => {
  g.localStorage = {getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {}};
  const silent = console.warn; console.warn = () => {};
  try { assert.doesNotThrow(() => saveTripToOfflineCache(config('t-1'), result(), dto('t-1'))); }
  finally { console.warn = silent; }
});
