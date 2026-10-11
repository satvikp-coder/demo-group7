import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from '../services/tripPlanner.js';

test('bounded alternatives recover a shorter feasible tour missed by every greedy weighting',()=>{
 const hotel={id:'hotel',name:'Fixture',lat:23,lng:72,price_per_night:100,rating:null};
 const attractions=['a','b'].map(id=>({id,name:id,lat:23,lng:72,entry_fee_numeric:0,duration_hours:1,rating:null,opening_time:'08:00',closing_time:'18:00'}));
 const routes=[
  {source_node_id:'hotel',destination_node_id:'a',distance_km:1,travel_time_minutes:5,reverse_distance_km:1,reverse_travel_time_minutes:5},
  {source_node_id:'hotel',destination_node_id:'b',distance_km:2,travel_time_minutes:10,reverse_distance_km:2,reverse_travel_time_minutes:10},
  {source_node_id:'a',destination_node_id:'b',distance_km:100,travel_time_minutes:120,reverse_distance_km:1,reverse_travel_time_minutes:5},
 ].map(r=>({...r,transport_mode:'road'}));
 const trip={trip_days:1,lodging_nights:0,budget:1000,start_time:'08:00',strategy:'distance-first',weights:{distance:100,cost:0,rating:0}};
 const result=buildPlan(trip,{hotel,attractions,restaurants:[],routes});
 assert.equal(result.stops.filter(s=>s.stop_type==='attraction').length,2);
 const explanation=result.summary.optimization;
 assert.equal(explanation.candidates[0].distance_km,4);
 assert.ok(explanation.evaluated_count>=2);
 assert.deepEqual(result,buildPlan(trip,{hotel,attractions,restaurants:[],routes}));
 assert.equal(explanation.score,Math.max(...explanation.candidates.map(c=>c.score)));
});

test('unknown opening hours remain an explicit advisory in persisted stop data',()=>{
 const hotel={id:'hotel',name:'Fixture',lat:23,lng:72,price_per_night:100};
 const attraction={id:'site',name:'Fixture site',lat:23,lng:72,entry_fee_numeric:0,duration_hours:1,opening_time:null,closing_time:null};
 const route={source_node_id:'hotel',destination_node_id:'site',distance_km:1,travel_time_minutes:5,reverse_distance_km:1,reverse_travel_time_minutes:5,transport_mode:'road'};
 const result=buildPlan({trip_days:1,lodging_nights:0,budget:1000,start_time:'08:00',strategy:'distance-first'}, {hotel,attractions:[attraction],restaurants:[],routes:[route]});
 assert.match(result.stops.find(s=>s.stop_type==='attraction').best_time_note,/Opening hours are unverified/);
});
