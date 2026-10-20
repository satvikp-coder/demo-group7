import test from 'node:test';
import assert from 'node:assert/strict';
import {point,distanceKm,estimatedLeg,validateRoad,createRouter} from '../services/mapRouting.js';
import {knownAmount,costDetails,comparableCostUtility} from '../services/costStatus.js';
const a={id:'a',lat:23,lng:72},b={id:'b',lat:23.01,lng:72.01};
const road={code:'Ok',waypoints:[{distance:0},{distance:0}],routes:[{geometry:{type:'LineString',coordinates:[[72,23],[72.005,23.005],[72.01,23.01]]},distance:1600,duration:300}]};
test('coordinates, distance, missing endpoints and coincident stops remain honest',()=>{
 assert.equal(point({lat:null,lng:72}),null);assert.equal(point({lat:'',lng:72}),null);assert.equal(point({lat:91,lng:72}),null);assert.equal(point({lat:23,lng:181}),null);
 assert.deepEqual(point(a),[72,23]);assert.equal(distanceKm([0,0],[0,0]),0);assert.ok(Math.abs(distanceKm([0,0],[0,1])-111.195)<.01);
 assert.equal(estimatedLeg(a,b).status,'estimated');assert.equal(estimatedLeg(a,b).duration_minutes,null);assert.equal(estimatedLeg(a,a).status,'same_location');assert.equal(estimatedLeg(a,{id:'x'}).status,'unavailable');
});
test('road validation rejects swapped/distant endpoints, malformed geometry and invalid units',()=>{
 const r=validateRoad(road,point(a),point(b));assert.equal(r.distance_km,1.6);assert.equal(r.duration_minutes,5);
 for(const bad of [{...road,code:'NoRoute'},{...road,waypoints:[{distance:900},{distance:0}]},{...road,routes:[{...road.routes[0],distance:-1}]},{...road,routes:[{...road.routes[0],geometry:{type:'LineString',coordinates:[[23,72],[23.01,72.01]]}}]}])assert.equal(validateRoad(bad,point(a),point(b)),null);
});
test('ordered direction/mode keyed geometry cache and mixed fallback do not mutate stops',async()=>{
 let calls=0;const router=createRouter({base:'https://test.invalid',interval:0,fetcher:async()=>{calls++;return new Response(JSON.stringify(road));}});
 const before=JSON.stringify([a,b]);assert.equal((await router.leg(a,b)).status,'road');assert.equal((await router.leg(a,b)).status,'road');assert.equal(calls,1);
 const result=await router.day([a,b,{id:'missing'},a]);assert.equal(result.road_legs,1);assert.equal(result.unavailable_legs,2);assert.equal(result.legs[0].from_stop_id,'a');assert.equal(result.legs[0].to_stop_id,'b');assert.equal(JSON.stringify([a,b]),before);
 assert.equal((await router.day([])).legs.length,0);assert.equal((await router.day([a])).legs.length,0);
 await router.leg(b,a);assert.equal(calls,2);
});
test('failure, cancellation, negative cache and concurrent calls are bounded honest estimates',async()=>{
 let calls=0;const router=createRouter({base:'https://test.invalid',interval:0,fetcher:async()=>{calls++;throw new Error('offline');}});
 assert.equal((await router.leg(a,b)).status,'estimated');await router.leg(a,b);assert.equal(calls,1);
 const abort=new AbortController();abort.abort();assert.equal((await router.leg(b,a,abort.signal)).status,'estimated');assert.equal(calls,1);
 assert.equal((await createRouter({base:''}).leg(a,b)).status,'estimated');
});
test('strict costs preserve known positive, zero and unknown with paise precision',()=>{
 for(const value of [null,undefined,'',true,-1,'oops',Infinity])assert.equal(knownAmount(value),null);
 assert.equal(knownAmount(0),0);assert.equal(knownAmount('100'),100);assert.equal(knownAmount(12.345),12.35);
 const trip={trip_days:1,lodging_nights:0,generation_summary:{transport_cost_known:false,cost_states:{'1:2':'KNOWN_ZERO'}}};
 const rows=[{day_number:1,stop_order:1,stop_type:'hotel',cost:0},{day_number:1,stop_order:2,stop_type:'attraction',cost:0},{day_number:1,stop_order:3,stop_type:'attraction',cost:100}];
 const d=costDetails(trip,rows);assert.equal(d.categories.hotel.state,'KNOWN_ZERO');assert.equal(d.categories.attractions.state,'KNOWN_POSITIVE');assert.equal(d.categories.meals.amount,null);assert.equal(d.categories.transit.amount,null);assert.equal(d.known_subtotal,100);assert.equal(d.final_total,null);assert.equal(d.complete,false);
 assert.deepEqual(d.unknown_components,['Food','Transport']);
 assert.equal(costDetails({},[{stop_type:'attraction',cost:0}]).categories.attractions.state,'UNKNOWN');
 assert.equal(costDetails(trip,[{stop_type:'attraction',cost:null}]).categories.attractions.state,'UNKNOWN');
 assert.equal(costDetails(trip,[{stop_type:'attraction',cost:.1},{stop_type:'attraction',cost:.2}]).known_subtotal,.3);
});
test('positive scheduled meals do not imply full trip food or known taxes',()=>{
 const d=costDetails({trip_days:3,lodging_nights:2,rooms:2},[{stop_type:'hotel',cost:10000},{stop_type:'meal',cost:600}]);
 assert.equal(d.known_subtotal,10600);assert.ok(d.unknown_components.includes('Additional food outside scheduled meals'));assert.ok(d.unknown_components.includes('Accommodation taxes and fees'));assert.equal(d.final_total,null);
});

test('unpriced/omitted meal coverage cannot create an artificial cheap candidate',()=>{
 const values=[{known_cost:100,priced_meal_count:0},{known_cost:500,priced_meal_count:1},{known_cost:600,priced_meal_count:1}];
 assert.equal(comparableCostUtility(values[0],values),0);assert.equal(comparableCostUtility(values[1],values),1);assert.equal(comparableCostUtility(values[2],values),0);
 const equal=[{known_cost:100,priced_meal_count:0},{known_cost:200,priced_meal_count:0}];assert.equal(comparableCostUtility(equal[0],equal),1);assert.equal(comparableCostUtility(equal[1],equal),0);
});
test('timeout aborts fetch and never returns a road duration or road status',async()=>{
 const router=createRouter({base:'https://test.invalid',interval:0,timeout:10,fetcher:async(_url,{signal})=>new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(new Error('timeout')),{once:true});setTimeout(()=>reject(new Error('safety deadline')),100);})});
 const result=await router.leg(a,b);assert.equal(result.status,'estimated');assert.equal(result.duration_minutes,null);
});

test('concurrency does not multiply provider traffic; mixed legs retain distinct statuses',async()=>{
 let finish,calls=0;const router=createRouter({base:'https://test.invalid',interval:0,fetcher:async()=>{calls++;return await new Promise(resolve=>{finish=()=>resolve(new Response(JSON.stringify(road)));});}});
 const pending=router.leg(a,b);await Promise.resolve();const concurrent=await router.leg(b,a);assert.equal(concurrent.status,'estimated');assert.equal(calls,1);finish();assert.equal((await pending).status,'road');
 let n=0;const mixed=createRouter({base:'https://test.invalid',interval:0,fetcher:async()=>{if(n++)throw Error('offline');return new Response(JSON.stringify(road));}});
 const result=await mixed.day([a,b,a]);assert.equal(result.road_legs,1);assert.equal(result.estimated_legs,1);assert.equal(result.legs[1].duration_minutes,null);
});
