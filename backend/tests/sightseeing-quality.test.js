import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from '../services/tripPlanner.js';
const hotel={id:'h',name:'Hotel',lat:23,lng:72,price_per_night:100};
const trip={trip_days:1,budget:10000,start_time:'08:00',strategy:'distance-first',lodging_nights:0,weights:{distance:0,cost:100,rating:0}};
const attraction=(id,extra={})=>({id,name:id,lat:23,lng:72,entry_fee_numeric:10,duration_hours:.5,rating:4,...extra});
const edge=(from,to,distance=1,minutes=5)=>({source_node_id:from,destination_node_id:to,distance_km:distance,travel_time_minutes:minutes,reverse_distance_km:distance,reverse_travel_time_minutes:minutes});
const restaurant={id:'r',name:'Restaurant',lat:23,lng:72,avg_cost_per_person:150};
test('a short sightseeing day returns promptly instead of forcing lunch and dinner waits',()=>{
 const plan=buildPlan(trip,{hotel,attractions:[attraction('a')],restaurants:[restaurant],routes:[edge('h','a'),edge('h','r'),edge('a','r')]});
 assert.equal(plan.stops.filter(s=>s.stop_type==='meal').length,0);
 assert.ok(plan.stops.at(-1).arrival_time<'10:00:00');
});
test('sparse multi-day plans never manufacture a meals-only sightseeing day',()=>{
 const plan=buildPlan({...trip,trip_days:2,lodging_nights:1},{hotel,attractions:[attraction('a')],restaurants:[restaurant],routes:[edge('h','a'),edge('h','r'),edge('a','r')]});
 assert.equal(plan.stops.filter(s=>s.day_number===2&&s.stop_type==='meal').length,0);
 assert.equal(plan.summary.day_coverage[1].attraction_count,0);
 assert.ok(plan.summary.warnings.includes('insufficient_sightseeing_days'));
});
test('missing direct restaurant-attraction routes use evidenced graph paths and resume sightseeing',()=>{
 const plan=buildPlan(trip,{hotel,attractions:[attraction('a',{duration_hours:4}),attraction('b',{opening_time:'14:00',closing_time:'18:00'})],restaurants:[restaurant],routes:[edge('h','a'),edge('h','b'),edge('h','r'),edge('a','r')]});
 const lunch=plan.stops.find(s=>s.category==='lunch');assert.ok(lunch);
 const later=plan.stops.find(s=>s.reference_id==='b');assert.ok(later.arrival_time>=lunch.departure_time);
 assert.ok(plan.summary.legs.some(l=>l.from==='r'&&l.to==='b'&&l.method==='dijkstra'));
});
test('cost priority ranks comparable sightseeing coverage instead of rewarding omitted visits',()=>{
 const plan=buildPlan(trip,{hotel,attractions:[attraction('a',{duration_hours:9,closing_time:'20:00'}),attraction('b',{closing_time:'10:00'})],restaurants:[],routes:[edge('h','a'),edge('h','b'),edge('a','b')]});
 assert.equal(plan.stops.filter(s=>s.stop_type==='attraction').length,2);
 assert.ok(plan.summary.optimization.candidates.every(c=>c.attraction_count===2));
 assert.equal(plan.summary.optimization.score,Math.max(...plan.summary.optimization.candidates.map(c=>c.score)));
});

test('later-opening visits preserve lunch instead of fast-forwarding the clock past the meal window',()=>{
 const plan=buildPlan(trip,{hotel,attractions:[attraction('a',{duration_hours:1}),attraction('b',{opening_time:'14:00',closing_time:'18:00'})],restaurants:[restaurant],routes:[edge('h','a'),edge('h','b'),edge('h','r'),edge('a','b'),edge('a','r'),edge('b','r')]});
 const lunch=plan.stops.find(s=>s.category==='lunch'),later=plan.stops.find(s=>s.reference_id==='b');
 assert.ok(lunch);assert.equal(lunch.arrival_time,'12:30:00');assert.ok(lunch.departure_time<=later.arrival_time);
 assert.equal(plan.stops.filter(s=>s.stop_type==='attraction').length,2);
});
test('unknown closing data cannot justify scheduling an attraction at night',()=>{
 const resources={hotel,attractions:[attraction('a',{duration_hours:2})],restaurants:[],routes:[edge('h','a')]};
 assert.throws(()=>buildPlan({...trip,start_time:'18:00'},resources),/No feasible/);
});
