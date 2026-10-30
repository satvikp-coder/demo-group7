import assert from 'node:assert/strict';
import {test} from 'node:test';
import {drawableLegs, stopPoint} from '../../frontend/src/utils/routeLegs';

const stops = [
  {id: 'a', lat: 23.02, lng: 72.57}, {id: 'b', lat: 23.03, lng: 72.58}, {id: 'c', lat: 23.04, lng: 72.59},
  {id: 'nowhere', lat: Number.NaN, lng: Number.NaN},
];
const geometry = [[72.57, 23.02], [72.58, 23.03]];
const leg = (from: string, to: string, coordinates: unknown[] = geometry) => ({from_stop_id: from, to_stop_id: to, coordinates});

test('a leg whose stop id does not exist is skipped instead of throwing', () => {
  const legs = [leg('a', 'b'), leg('b', 'ghost'), leg('ghost', 'c'), leg('b', 'c')];
  let result: ReturnType<typeof drawableLegs<typeof legs[number]>> = [];
  assert.doesNotThrow(() => { result = drawableLegs(legs, stops); });
  assert.deepEqual(result.map(l => `${l.from_stop_id}>${l.to_stop_id}`), ['a>b', 'b>c']); // the other legs still render
});

test('legs with no geometry or an unlocated end stop are skipped too', () => {
  assert.deepEqual(drawableLegs([leg('a', 'b', []), leg('a', 'nowhere'), leg('a', 'c')], stops).map(l => l.to_stop_id), ['c']);
  assert.deepEqual(drawableLegs([], stops), []);
  assert.deepEqual(drawableLegs([leg('a', 'b')], []), []);
});

test('stopPoint accepts a missing stop and rejects invalid coordinates', () => {
  assert.equal(stopPoint(undefined), null);
  assert.equal(stopPoint(null), null);
  assert.deepEqual(stopPoint({id: 'x', lat: 23, lng: 72}), [23, 72]);
  for (const bad of [{id: 'x'}, {id: 'x', lat: 91, lng: 72}, {id: 'x', lat: 23, lng: 181}, {id: 'x', lat: Infinity, lng: 72}])
    assert.equal(stopPoint(bad), null, JSON.stringify(bad));
});
