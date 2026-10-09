import test from 'node:test';
import assert from 'node:assert/strict';
import {adjustWeight,DEFAULT_WEIGHTS,STRATEGY_WEIGHTS,validWeights,utility,weightedScore} from '../../dsa/planning/priorities.ts';
import {buildPlan} from '../services/tripPlanner.js';
const hotel={id:'hotel',name:'Fixture hotel',lat:23,lng:72,price_per_night:100,rating:null};
const attractions=[['near',1,100,2],['cheap',5,0,2],['rated',6,120,5]].map(([id,distance,fee,rating])=>({id,name:id,lat:23,lng:72,entry_fee_numeric:fee,rating,duration_hours:10,opening_time:'08:00',closing_time:'19:00',distance}));
const resources={hotel,attractions,restaurants:[],routes:attractions.map(a=>({source_node_id:'hotel',destination_node_id:a.id,distance_km:a.distance,travel_time_minutes:10,reverse_distance_km:a.distance,reverse_travel_time_minutes:10,transport_mode:'road'}))};
const trip={trip_days:1,budget:1000,start_time:'08:00',strategy:'distance-first',wheelchair_accessible_only:false};
test('every slider allocation remains integral, bounded and sums to 100 including extremes',()=>{
 let state=DEFAULT_WEIGHTS;
 for(const key of ['distance','cost','rating'])for(let value=0;value<=100;value++) {state=adjustWeight(state,key,value);assert.ok(validWeights(state));assert.equal(state[key],value);}
 for(const weights of [null,{}, {distance:34,cost:33,rating:34},{distance:34.5,cost:32.5,rating:33},{distance:100,cost:0,rating:0,extra:0}])assert.equal(validWeights(weights),false);
 assert.deepEqual(adjustWeight({distance:100,cost:0,rating:0},'distance',0),{distance:0,cost:50,rating:50});
});
test('utilities have correct direction, constant and missing handling; weighted score independently calculated',()=>{
 assert.equal(utility(2,[2,4,6],true),1);assert.equal(utility(6,[2,4,6],true),0);assert.equal(utility(4,[2,4,6],false),.5);assert.equal(utility(2,[2,2],true),1);assert.equal(utility(null,[2,2],true),0);
 assert.equal(weightedScore({distance:.2,cost:.8,rating:.4},{distance:25,cost:50,rating:25}),.55);
});
test('actual existing scheduler selects real tradeoffs and highest independently recomputed score',()=>{
 const cases=[['distance-first','near'],['budget-first','cheap'],['rating-first','rated']];
 for(const [strategy,id] of cases){
  const weights=STRATEGY_WEIGHTS[strategy],result=buildPlan({...trip,weights},resources),explain=result.summary.optimization;
  assert.equal(result.stops.find(s=>s.stop_type==='attraction').reference_id,id);
  assert.ok(explain.evaluated_count>=3);
  for(const c of explain.candidates){const expected=(weights.distance*c.utilities.distance+weights.cost*c.utilities.cost+weights.rating*c.utilities.rating)/100;assert.ok(Math.abs(c.score-expected)<1e-12);assert.ok(c.known_cost<=trip.budget);}
  assert.equal(explain.selected_candidate_id,explain.candidates[0].id);assert.equal(explain.score,Math.max(...explain.candidates.map(c=>c.score)));
  assert.deepEqual(buildPlan({...trip,weights},resources),result);
 }
 for(const weights of [DEFAULT_WEIGHTS,{distance:100,cost:0,rating:0},{distance:0,cost:100,rating:0},{distance:0,cost:0,rating:100}])assert.ok(buildPlan({...trip,weights},resources).summary.optimization.score>=0);
});
test('unknown ratings remain unknown, missing fees excluded, infeasible budget/routes fail honestly',()=>{
 const unknown={...resources,hotel:{...hotel,rating:null},attractions:attractions.map(a=>({...a,rating:null}))};
 const result=buildPlan({...trip,weights:DEFAULT_WEIGHTS},unknown);assert.ok(result.summary.optimization.candidates.every(c=>c.rating_mean===null&&c.utilities.rating===0));
 assert.throws(()=>buildPlan({...trip,budget:99,weights:DEFAULT_WEIGHTS},resources),/No feasible/);
 assert.throws(()=>buildPlan({...trip,weights:DEFAULT_WEIGHTS},{...resources,routes:[]}),/No feasible/);
 assert.throws(()=>buildPlan({...trip,weights:DEFAULT_WEIGHTS},{...resources,attractions:attractions.map(a=>({...a,entry_fee_numeric:null}))}),/No feasible/);
});
test('group costs use rooms and per-person admission, never multiply route distance',()=>{
 const weights={distance:100,cost:0,rating:0},one=buildPlan({...trip,weights},resources),group=buildPlan({...trip,weights,travelers:3,rooms:2},resources);
 assert.equal(group.summary.hotel_total,200);assert.equal(group.stops.find(s=>s.stop_type==='attraction').cost,300);
 assert.equal(group.summary.optimization.candidates[0].known_cost,500);
 assert.equal(group.summary.optimization.candidates[0].distance_km,one.summary.optimization.candidates[0].distance_km);
});

test('changed hotel coordinates invalidate old OSRM evidence instead of reusing stale road distance',()=>{
 const data={...resources,routes:resources.routes.map(r=>({...r,source_url:'https://router.project-osrm.org/table/v1/driving/72,23?annotations=distance,duration'}))};
 assert.ok(buildPlan({...trip,weights:DEFAULT_WEIGHTS},data).stops.length);
 assert.throws(()=>buildPlan({...trip,weights:DEFAULT_WEIGHTS},{...data,hotel:{...hotel,lat:24}}),/No feasible/);
});
