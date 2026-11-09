import assert from 'node:assert/strict';
import {test} from 'node:test';
import {savedLegKm} from '../../frontend/src/utils/savedLegDistances';

// The Ahmedabad day 1 legs that disagreed: saved records 0.58 + 3.99 + 3.83 + 4 + 4.89 = 17.29 km.
const day1 = [
  {id: 'hotel-out', legDistanceKm: 0.58}, {id: 'mosque', legDistanceKm: 3.99}, {id: 'museum', legDistanceKm: 3.83},
  {id: 'lunch', legDistanceKm: 4}, {id: 'lake', legDistanceKm: 4.89}, {id: 'hotel-back'},
];

test('each leg distance comes from the saved record that starts at that stop', () => {
  assert.equal(savedLegKm(day1, 'hotel-out'), 0.58);
  assert.equal(savedLegKm(day1, 'lake'), 4.89);
  const total = day1.reduce((n, s) => n + (savedLegKm(day1, s.id) ?? 0), 0);
  assert.equal(Math.round(total * 100) / 100, 17.29); // same legs the list adds up for this day
});

test('the last stop, a stop with no record, an unknown id and a NaN record all give no distance', () => {
  assert.equal(savedLegKm(day1, 'hotel-back'), null);
  assert.equal(savedLegKm([{id: 'a'}, {id: 'b'}], 'a'), null);
  assert.equal(savedLegKm(day1, 'missing'), null);
  assert.equal(savedLegKm([{id: 'a', legDistanceKm: Number.NaN}], 'a'), null);
});

test('a zero-length recorded leg is kept as zero', () => {
  assert.equal(savedLegKm([{id: 'a', legDistanceKm: 0}, {id: 'b'}], 'a'), 0);
});
