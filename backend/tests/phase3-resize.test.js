import test from 'node:test';
import assert from 'node:assert/strict';
import {resizeAccommodation} from '../../dsa/planning/resizeAccommodation.ts';

test('What If shortening updates explicit nights and checkout without modifying saved config',()=>{
 const original={tripDays:7,lodgingNights:6,arrivalDate:'2026-10-19',departureDate:'2026-10-25',rooms:2};
 const next=resizeAccommodation(original,1);
 assert.equal(next.lodgingNights,0);assert.equal(next.departureDate,'2026-10-19');assert.equal(next.rooms,2);
 assert.equal(original.lodgingNights,6);assert.equal(original.departureDate,'2026-10-25');
 assert.equal(resizeAccommodation(original,3).lodgingNights,2);
});

test('What If preserves legacy nights, explicit no-stay and additional-night conventions',()=>{
 assert.equal(resizeAccommodation({tripDays:3},1).lodgingNights,undefined);
 assert.equal(resizeAccommodation({tripDays:3,lodgingNights:0},5).lodgingNights,0);
 assert.equal(resizeAccommodation({tripDays:3,lodgingNights:4},1).lodgingNights,2);
 assert.equal(resizeAccommodation({tripDays:3,arrivalDate:'2028-02-28',departureDate:'2028-03-01'},4).departureDate,'2028-03-02');
 assert.throws(()=>resizeAccommodation({tripDays:3,lodgingNights:2},0),/Trip days/);
});
