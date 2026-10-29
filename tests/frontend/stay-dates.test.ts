import assert from 'node:assert/strict';
import {test} from 'node:test';
import {addNights, nightsBetween, stayDateIssue} from '../../frontend/src/utils/stayDates';

const defaultNights = (days: number) => Math.max(0, days - 1); // the planner's default when no dates are set

test('same-day stay is zero nights and is accepted', () => {
  assert.equal(nightsBetween('2026-11-01', '2026-11-01'), 0);
  assert.equal(stayDateIssue({days: 1, nights: 0, arrival: '2026-11-01', departure: '2026-11-01'}), '');
});

test('one night and multi-night stays derive the right count, including across month and year ends', () => {
  assert.equal(nightsBetween('2026-11-01', '2026-11-02'), 1);
  assert.equal(nightsBetween('2026-11-01', '2026-11-04'), 3);
  assert.equal(nightsBetween('2026-12-30', '2027-01-02'), 3);
  assert.equal(nightsBetween('2028-02-28', '2028-03-01'), 2); // leap year
});

test('invalid dates give no count and a clear reason', () => {
  assert.equal(nightsBetween('2026-11-03', '2026-11-01'), null);
  assert.equal(nightsBetween('2026-13-01', '2026-11-01'), null);
  assert.equal(nightsBetween('', '2026-11-01'), null);
  assert.match(stayDateIssue({days: 3, nights: 2, arrival: '2026-11-03', departure: '2026-11-01'}), /must not precede arrival/);
  assert.match(stayDateIssue({days: 3, nights: 2, arrival: '2026-11-01', departure: ''}), /both accommodation arrival and departure/);
  assert.match(stayDateIssue({days: 2, nights: 6, arrival: '', departure: ''}), /between zero and trip days plus one/);
});

test('missing dates keep the default of trip days minus one, with no issue', () => {
  for (const days of [1, 2, 3, 7]) assert.equal(stayDateIssue({days, nights: defaultNights(days), arrival: '', departure: ''}), '');
  assert.equal(defaultNights(3), 2);
});

test('a 3-day trip with default nights is rejected for a 1-night date range until nights follow the dates', () => {
  const before = stayDateIssue({days: 3, nights: defaultNights(3), arrival: '2026-11-01', departure: '2026-11-02'});
  assert.match(before, /dates and nights must agree/); // the original blocked case
  const derived = nightsBetween('2026-11-01', '2026-11-02')!;
  assert.equal(stayDateIssue({days: 3, nights: derived, arrival: '2026-11-01', departure: '2026-11-02'}), '');
  // Changing the dates again keeps working because nights are re-derived each time.
  const again = nightsBetween('2026-11-01', '2026-11-04')!;
  assert.equal(again, 3);
  assert.equal(stayDateIssue({days: 3, nights: again, arrival: '2026-11-01', departure: '2026-11-04'}), '');
});

test('editing nights moves the departure date so the pair stays valid', () => {
  assert.equal(addNights('2026-11-01', 2), '2026-11-03');
  assert.equal(addNights('2026-12-31', 1), '2027-01-01');
  assert.equal(addNights('', 2), null);
  assert.equal(addNights('2026-11-01', -1), null);
  for (const n of [0, 1, 2, 4]) {
    const departure = addNights('2026-11-01', n)!;
    assert.equal(stayDateIssue({days: 3, nights: n, arrival: '2026-11-01', departure}), '');
  }
});
