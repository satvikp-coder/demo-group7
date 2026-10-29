import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MAX_SIMULATED_BUDGET, parseBudgetCap} from '../../frontend/src/utils/budgetCap';

test('valid whole-rupee amounts are accepted, including zero and the maximum', () => {
  assert.deepEqual(parseBudgetCap('5000'), {value: 5000, message: ''});
  assert.deepEqual(parseBudgetCap('  12500 '), {value: 12500, message: ''});
  assert.deepEqual(parseBudgetCap('0'), {value: 0, message: ''});
  assert.deepEqual(parseBudgetCap(String(MAX_SIMULATED_BUDGET)), {value: MAX_SIMULATED_BUDGET, message: ''});
  assert.deepEqual(parseBudgetCap('1234.6'), {value: 1235, message: ''});
});

test('negative, blank, non-numeric, NaN and infinite input is rejected with a message', () => {
  for (const bad of ['-1', '-0.5', '', '   ', 'abc', 'NaN', 'Infinity', '-Infinity', '1e999', '12abc']) {
    const result = parseBudgetCap(bad);
    assert.equal(result.value, null, JSON.stringify(bad));
    assert.ok(result.message.length > 0, JSON.stringify(bad));
  }
  assert.match(parseBudgetCap('-1').message, /negative/i);
});

test('amounts above the maximum are rejected', () => {
  const result = parseBudgetCap(String(MAX_SIMULATED_BUDGET + 1));
  assert.equal(result.value, null);
  assert.match(result.message, /cannot exceed/i);
});
