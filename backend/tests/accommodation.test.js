import test from 'node:test';
import assert from 'node:assert/strict';
import {accommodationNights,calendarDay,lodgingSubtotal} from '../../dsa/planning/accommodation.ts';
import {buildPlan} from '../services/tripPlanner.js';
test('explicit day trip, multi-day, arrival/departure and legacy nights remain distinct',()=>{
 for(const [days,nights] of [[1,0],[2,1],[3,2],[3,4]])assert.equal(accommodationNights({days,lodging_nights:nights}),nights);
 assert.equal(accommodationNights({days:3}),3);
 assert.equal(accommodationNights({days:3,arrival_date:'2026-10-31',departure_date:'2026-11-02'}),2);
 assert.equal(accommodationNights({days:1,arrival_date:'2026-11-02',departure_date:'2026-11-02'}),0);
 for(const input of [{days:2,lodging_nights:-1},{days:1,lodging_nights:3},{days:3,arrival_date:'2026-11-02'},{days:3,arrival_date:'2026-11-02',departure_date:'2026-11-01'},{days:3,lodging_nights:1,arrival_date:'2026-11-02',departure_date:'2026-11-04'}])assert.throws(()=>accommodationNights(input));
 assert.equal(calendarDay('2026-02-30'),null);assert.notEqual(calendarDay('2028-02-29'),null);
});
test('room-night multiplication uses paise and missing rates never become free rooms',()=>{
 assert.equal(lodgingSubtotal(1500.15,2,3),9000.90);assert.equal(lodgingSubtotal(null,2,1),null);assert.equal(lodgingSubtotal(null,0,1),0);
});
test('actual planner hotel ledger equals explicit nights times rooms including arrival/departure extras',()=>{
 const hotel={id:'h',name:'Fixture',lat:23,lng:72,price_per_night:100};
 for(const [days,nights] of [[1,0],[2,1],[3,2],[3,4]]){
  const p=buildPlan({trip_days:days,lodging_nights:nights,rooms:2,budget:10000,start_time:'08:00',strategy:'distance-first'},{hotel,attractions:[],restaurants:[],routes:[]});
  assert.equal(p.summary.hotel_total,nights*200);assert.equal(p.stops.reduce((sum,s)=>sum+s.cost,0),nights*200);assert.equal(p.summary.lodging_nights,nights);
 }
});
