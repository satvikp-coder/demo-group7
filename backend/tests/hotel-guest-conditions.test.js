import test from 'node:test';
import assert from 'node:assert/strict';
import {lodgingGuestIssue,lodgingSubtotal} from '../../dsa/planning/accommodation.ts';

test('sourced minimum guest restriction applies to a purchased stay',()=>{
 assert.deepEqual(lodgingGuestIssue({minimum_guests:2},1,1,1),{kind:'minimum',minimum:2});
 assert.equal(lodgingGuestIssue({minimum_guests:2},1,2,1),null);
});
test('group estimates require enough quoted rooms without inventing extra-guest prices',()=>{
 assert.deepEqual(lodgingGuestIssue({priced_guests_per_room:2},2,7,1),{kind:'rooms',capacity:2,requiredRooms:4});
 assert.equal(lodgingGuestIssue({priced_guests_per_room:2},2,7,4),null);
 assert.equal(lodgingSubtotal(1700,2,4),13600);
});
test('zero-night route anchors do not purchase a room or require hotel occupancy',()=>{
 assert.equal(lodgingGuestIssue({minimum_guests:2,priced_guests_per_room:2},0,1,1),null);
 assert.equal(lodgingGuestIssue({priced_guests_per_room:2},0,7,1),null);
});
test('old records with unknown occupancy remain compatible',()=>{
 assert.equal(lodgingGuestIssue(undefined,2,7,1),null);
 assert.equal(lodgingGuestIssue({},2,7,1),null);
});
