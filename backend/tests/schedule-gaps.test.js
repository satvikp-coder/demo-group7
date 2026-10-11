import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from '../services/tripPlanner.js';
import {scheduleGaps} from '../../dsa/planning/scheduleGaps.ts';
import {getMaxAttractionsPerDay} from '../../dsa/greedy/daySplitter.ts';
const hotel={id:'h',name:'Hotel',lat:23,lng:72,price_per_night:100};
const trip={trip_days:1,budget:10000,start_time:'08:00',strategy:'distance-first',lodging_nights:0};
const attraction=id=>({id,name:id,lat:23,lng:72,entry_fee_numeric:10,duration_hours:.5,rating:4});
const edge=(from,to)=>({source_node_id:from,destination_node_id:to,distance_km:1,travel_time_minutes:5,reverse_distance_km:1,reverse_travel_time_minutes:5});
test('older saved same-restaurant waits display without rewriting records; unknown transfers stay unknown',()=>{
 const stops=[{day_number:1,stop_order:1,reference_id:'r',arrival_time:'12:30:00',departure_time:'13:30:00'},{day_number:1,stop_order:2,reference_id:'r',arrival_time:'19:30:00',departure_time:'20:30:00'}];
 const original=JSON.stringify(stops);assert.equal(scheduleGaps(stops,[])[0].duration_minutes,360);assert.equal(JSON.stringify(stops),original);
 assert.deepEqual(scheduleGaps([stops[0],{...stops[1],reference_id:'different'}],[]),[]);
});
test('daily allocation does not discard available short visits at an arbitrary four-stop cap',()=>{
 const attractions=Array.from({length:6},(_,i)=>attraction('a'+i));
 const nodes=['h',...attractions.map(a=>a.id)];const routes=nodes.flatMap((a,i)=>nodes.slice(i+1).map(b=>edge(a,b)));
 const plan=buildPlan(trip,{hotel,attractions,restaurants:[],routes});
 assert.equal(plan.stops.filter(s=>s.stop_type==='attraction').length,6);
 assert.equal(getMaxAttractionsPerDay(10,2,'rating-first'),5);
});
test('sparse catalog lunch-to-dinner gap is explicit and excludes actual travel time',()=>{
 const restaurant={id:'r',name:'Restaurant',lat:23,lng:72,avg_cost_per_person:150};
 const plan=buildPlan(trip,{hotel,attractions:[attraction('a')],restaurants:[restaurant],routes:[edge('h','a'),edge('h','r'),edge('a','r')]});
 const lunch=plan.stops.find(s=>s.category==='lunch'),dinner=plan.stops.find(s=>s.category==='dinner');
 const gap=plan.summary.free_time.find(g=>g.before_stop_order===dinner.stop_order);
 assert.equal(lunch.departure_time,'13:30:00');assert.equal(gap.start_time,'13:30:00');assert.equal(gap.end_time,'19:30:00');assert.equal(gap.duration_minutes,360);
 assert.equal(plan.stops.filter(s=>s.stop_type==='attraction').length,1);
});
test('known transfers are excluded from free intervals, with no overlap or duplicate visits',()=>{
 const restaurant={id:'r',name:'Restaurant',lat:23,lng:72,avg_cost_per_person:150};
 const plan=buildPlan(trip,{hotel,attractions:[attraction('a')],restaurants:[restaurant],routes:[edge('h','a'),edge('h','r'),edge('a','r')]});
 const wait=plan.summary.free_time.find(g=>g.before_stop_order===3);
 assert.equal(wait.end_time,'12:25:00');
 for(let i=1;i<plan.stops.length;i++)assert.ok(plan.stops[i].arrival_time>=plan.stops[i-1].departure_time);
 assert.equal(new Set(plan.stops.filter(s=>s.stop_type==='attraction').map(s=>s.reference_id)).size,1);
 assert.ok(plan.summary.free_time.every(g=>g.duration_minutes>=60));
});
test('multi-day allocation retains alternatives for later days',()=>{
 const attractions=Array.from({length:6},(_,i)=>attraction('a'+i));
 const nodes=['h',...attractions.map(a=>a.id)],routes=nodes.flatMap((a,i)=>nodes.slice(i+1).map(b=>edge(a,b)));
 const plan=buildPlan({...trip,trip_days:2},{hotel,attractions,restaurants:[],routes});
 assert.deepEqual([1,2].map(day=>plan.stops.filter(s=>s.day_number===day&&s.stop_type==='attraction').length),[3,3]);
});
