import assert from 'node:assert/strict';
import {test} from 'node:test';
import {executionTimeLabel} from '../../frontend/src/utils/executionTime';

test('a recorded time is shown with its unit', () => {
  assert.equal(executionTimeLabel(12), '12ms');
  assert.equal(executionTimeLabel(0), '0ms');
  assert.equal(executionTimeLabel(1234), '1,234ms');
});

test('an absent time produces no label, so no unit can be attached to "Not available"', () => {
  for (const missing of [Number.NaN, Infinity, -1, undefined, null, '12'])
    assert.equal(executionTimeLabel(missing), null, String(missing));
});
