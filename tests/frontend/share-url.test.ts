import assert from 'node:assert/strict';
import {test} from 'node:test';
import {decodeSharedItinerary, encodeSharedItinerary, getSharedFromUrl} from '../../frontend/src/utils/shareUrl';

// Builds a link the same way the app does, from any JSON value (used for old-version and hand-made links).
const link = (value: unknown) =>
  encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(value)).replace(/%([0-9A-F]{2})/g, (_m, p) => String.fromCharCode(parseInt(p, 16)))));

const full = {
  tripId: '11111111-1111-4111-8111-111111111111', cityId: 'somnath', tripDays: 3, budget: 20000,
  startingHotelId: '22222222-2222-4222-8222-222222222222', startTime: '09:00 AM', strategy: 'budget-first' as const,
  travelers: 4, rooms: 2, lodgingNights: 2, arrivalDate: '2026-11-01', departureDate: '2026-11-03', startDate: '2026-11-01',
  wheelchairAccessibleOnly: true, weights: {distance: 20, cost: 50, rating: 30}, hotelCategory: 'Budget' as const,
};

test('a current link round-trips travelers, rooms, nights, dates, wheelchair flag, weights and hotel category', () => {
  assert.deepEqual(decodeSharedItinerary(encodeSharedItinerary(full)), {...full, selectedSites: undefined});
});

test('a version 1 link decodes with defaults and none of the newer preferences', () => {
  const old = decodeSharedItinerary(link({tripId: 'abc', cityId: 'dwarka', tripDays: 2, budget: 9000, startTime: '08:00 AM', strategy: 'distance-first', v: 1}));
  assert.equal(old?.cityId, 'dwarka'); assert.equal(old?.tripDays, 2); assert.equal(old?.budget, 9000);
  for (const key of ['travelers', 'rooms', 'lodgingNights', 'arrivalDate', 'departureDate', 'startDate', 'wheelchairAccessibleOnly', 'weights', 'hotelCategory'])
    assert.equal((old as Record<string, unknown>)[key], undefined, key);
});

test('a link with no version and missing days/budget still gets sensible defaults', () => {
  const legacy = decodeSharedItinerary(link({cityId: 'modhera'}));
  assert.deepEqual([legacy?.cityId, legacy?.tripDays, legacy?.budget, legacy?.startTime], ['modhera', 2, 8500, '08:00 AM']);
});

test('invalid optional values are dropped to defaults instead of being trusted', () => {
  const decoded = decodeSharedItinerary(link({cityId: 'somnath', v: 2, travelers: 0, rooms: 'two', lodgingNights: -1,
    arrivalDate: '2026-13-45', departureDate: 'tomorrow', wheelchairAccessibleOnly: 'yes', weights: {distance: 40, cost: 40, rating: 10}, hotelCategory: 'Palace'}));
  assert.equal(decoded?.cityId, 'somnath');
  for (const key of ['travelers', 'rooms', 'lodgingNights', 'arrivalDate', 'departureDate', 'wheelchairAccessibleOnly', 'weights', 'hotelCategory'])
    assert.equal((decoded as Record<string, unknown>)[key], undefined, key);
});

test('malformed links do not decode', () => {
  const silent = console.error; console.error = () => {};
  try {
    for (const bad of ['', '%E0%A4%A', 'not-base64!!', link('just a string'), link({tripDays: 2}), link({cityId: 42}), link({cityId: 'somnath', v: 99}), encodeURIComponent(btoa('{broken'))])
      assert.equal(decodeSharedItinerary(bad), null, JSON.stringify(bad));
  } finally { console.error = silent; }
});

test('getSharedFromUrl reports a malformed link as a failure with a message, and a good link as success', () => {
  const silent = console.error; console.error = () => {};
  const g = globalThis as unknown as {window?: unknown};
  try {
    g.window = {location: {search: '?shared=%E0%A4%A', pathname: '/', hash: '', origin: 'http://x'}};
    const bad = getSharedFromUrl();
    assert.ok(bad && bad.success === false && /malformed|corrupted/i.test(bad.error));
    g.window = {location: {search: '?shared=' + encodeSharedItinerary(full), pathname: '/', hash: '', origin: 'http://x'}};
    const good = getSharedFromUrl();
    assert.ok(good && good.success === true && good.config.travelers === 4 && good.config.wheelchairAccessibleOnly === true);
    g.window = {location: {search: '', pathname: '/', hash: '', origin: 'http://x'}};
    assert.equal(getSharedFromUrl(), null);
  } finally { delete g.window; console.error = silent; }
});
