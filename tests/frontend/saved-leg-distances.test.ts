import assert from 'node:assert/strict';
import {test} from 'node:test';
import {savedDayKm, savedLegKm} from '../../frontend/src/utils/savedLegDistances';

// The Ahmedabad day 1 legs that disagreed: saved records 0.58 + 3.99 + 3.83 + 4 + 4.89 = 17.29 km.
const day1 = [
  {id: 'hotel-out', legDistanceKm: 0.58}, {id: 'mosque', legDistanceKm: 3.99}, {id: 'museum', legDistanceKm: 3.83},
  {id: 'lunch', legDistanceKm: 4}, {id: 'lake', legDistanceKm: 4.89}, {id: 'hotel-back'},
];

test('the day distance is the sum of the saved leg records and equals the list total', () => {
  assert.equal(savedDayKm(day1), 17.29);
  assert.equal(savedLegKm(day1, 'lake'), 4.89);
});

test('the last stop has no outgoing leg and is not required to have a distance', () => {
  assert.equal(savedLegKm(day1, 'hotel-back'), null);
  assert.equal(savedDayKm([{id: 'a', legDistanceKm: 2}, {id: 'b'}]), 2);
});

test('any leg without a saved record makes the day total unavailable instead of a partial sum', () => {
  assert.equal(savedDayKm([{id: 'a', legDistanceKm: 2}, {id: 'b'}, {id: 'c'}]), null);
  assert.equal(savedDayKm([{id: 'a', legDistanceKm: Number.NaN}, {id: 'b'}]), null);
});

test('zero-length legs (same stop repeated) count as zero and a single stop sums to zero', () => {
  assert.equal(savedDayKm([{id: 'a', legDistanceKm: 0}, {id: 'b'}]), 0);
  assert.equal(savedDayKm([{id: 'only'}]), 0);
});
