import test from "node:test";
import assert from "node:assert/strict";
import { buildPlan } from "../services/tripPlanner.js";
import { scoreAttraction } from "../../dsa/greedy/routeBuilder.ts";

const hotel = {id:"hotel",name:"Selected hotel",lat:23,lng:72,price_per_night:100};
const trip = {trip_days:1,budget:1000,start_time:"08:00",strategy:"distance-first",wheelchair_accessible_only:true};
const attraction = (id,access=true) => ({id,name:id,lat:23,lng:72,entry_fee_numeric:10,
  duration_hours:0.5,rating:4.5,wheelchair_accessible:access});
const route = (from,to,distance) => ({source_node_id:from,destination_node_id:to,
  distance_km:distance,travel_time_minutes:5,transport_mode:"road"});

test("a direct attraction row wins even when Dijkstra could find a shorter path",()=>{
  const result=buildPlan(trip,{hotel,attractions:[attraction("a"),attraction("b")],restaurants:[],
    routes:[route("hotel","a",1),route("hotel","b",2),route("a","b",20)]});
  const leg=result.summary.legs.find(l=>l.from==="a" && l.to==="b");
  assert.equal(leg.method,"direct");
  assert.equal(leg.distance_km,20);
  assert.equal(result.summary.routing.dijkstra_calls,0);
});

test("wheelchair filtering also removes inaccessible intermediate graph nodes",()=>{
  const result=buildPlan(trip,{hotel,attractions:[attraction("a"),attraction("b"),attraction("stairs",false)],restaurants:[],
    routes:[route("hotel","a",1),route("hotel","b",2),route("a","stairs",0.1),route("stairs","b",0.1)]});
  const leg=result.summary.legs.find(l=>l.from==="a" && l.to==="b");
  assert.equal(leg.method,"dijkstra");
  assert.deepEqual(leg.path,["a","hotel","b"]);
  assert.ok(result.stops.every(s=>s.reference_id!=="stairs"));
});

test("missing routes never invent travel, prices or substitute the selected hotel",()=>{
  const result=buildPlan({...trip,budget:50},{hotel,attractions:[attraction("unknown",null)],restaurants:[],routes:[]});
  assert.equal(result.summary.hotel_over_budget,true);
  assert.equal(result.summary.hotel_replaced,false);
  assert.ok(result.summary.warnings.includes("no_route_data"));
  assert.equal(result.summary.excluded_attractions[0].reason,"accessibility_unknown");
  assert.deepEqual(result.stops.map(s=>s.reference_id),["hotel","hotel"]);
  assert.equal(result.stops.reduce((sum,s)=>sum+s.cost,0),100);
});

test("separately evidenced reverse route controls return distance and time",()=>{
 const forward={...route("hotel","a",1),reverse_distance_km:9,reverse_travel_time_minutes:27};
 const result=buildPlan(trip,{hotel,attractions:[attraction("a")],restaurants:[],routes:[forward]});
 const back=result.summary.legs.find(l=>l.from==="a"&&l.to==="hotel");
 assert.equal(back.distance_km,9);assert.equal(back.minutes,27);
 assert.ok(!result.summary.warnings.includes("reverse_route_estimate_unverified"));
 const assumed=buildPlan(trip,{hotel,attractions:[attraction("a")],restaurants:[],routes:[route("hotel","a",1)]});
 assert.ok(assumed.summary.warnings.includes("reverse_route_estimate_unverified"));
});

const decimalPlan = finalFee => {
 const selected={...hotel,price_per_night:499};
 const priced=[.30,.60,finalFee].map((fee,index)=>({...attraction('decimal-'+index),entry_fee_numeric:fee,duration_hours:.1}));
 return buildPlan({...trip,budget:500,wheelchair_accessible_only:false},{hotel:selected,attractions:priced,restaurants:[],routes:[
  route('hotel','decimal-0',1),route('hotel','decimal-1',5),route('hotel','decimal-2',10),
  route('decimal-0','decimal-1',1),route('decimal-0','decimal-2',10),route('decimal-1','decimal-2',1),
 ]});
};
test('paise-precision balance schedules a final admission that exactly fits the budget',()=>{
 const result=decimalPlan(.10);
 assert.deepEqual(result.stops.filter(stop=>stop.stop_type==='attraction').map(stop=>stop.cost),[.30,.60,.10]);
 assert.equal(Math.round(result.stops.reduce((total,stop)=>total+stop.cost,0)*100),50000);
 assert.equal(result.summary.unscheduled_attractions.length,0);
 assert.equal(result.summary.hotel_replaced,false);
});
test('rounding the balance never admits an attraction one paisa over the available budget',()=>{
 const result=decimalPlan(.11);
 assert.deepEqual(result.stops.filter(stop=>stop.stop_type==='attraction').map(stop=>stop.cost),[.30,.60]);
 assert.equal(result.summary.unscheduled_attractions.length,1);
});
test('rating-first scoring preserves a real zero and does not invent ratings for missing data',()=>{
 const score=rating=>scoreAttraction({entryFeeNumeric:0,rating,lat:23,lng:72},{lat:23,lng:72},1000,'rating-first',()=>1);
 assert.ok(score(0)<score(4));assert.equal(score(undefined),score(0));assert.equal(score(Number.NaN),score(0));
});
