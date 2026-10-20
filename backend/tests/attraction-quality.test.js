import test from 'node:test';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {buildPlan} from '../services/tripPlanner.js';
import {visitPolicy,isClosed,visitWindow} from '../services/attractionPlanning.js';
import {costDetails} from '../services/costStatus.js';
const hotel={id:'h',name:'Hotel',lat:23,lng:72,price_per_night:100};
const trip={trip_days:1,budget:10000,start_time:'08:00',strategy:'distance-first',lodging_nights:0,start_date:'2026-11-10',weights:{distance:34,cost:33,rating:33}};
const a=(id,extra={})=>({id,slug:id,name:id,lat:23,lng:72,category:'museum',entry_fee_numeric:10,duration_hours:1,rating:null,source_url:'https://example.test/official/'+id,...extra});
const edge=(from,to,km=1,minutes=5)=>({source_node_id:from,destination_node_id:to,distance_km:km,travel_time_minutes:minutes,reverse_distance_km:km,reverse_travel_time_minutes:minutes});
const resources=attractions=>({hotel,attractions,restaurants:[],routes:attractions.flatMap((x,i)=>[edge('h',x.id),...attractions.slice(i+1).map(y=>edge(x.id,y.id))])});
test('sourced unknown fee/duration can be provisional without becoming free',()=>{
 const plan=buildPlan(trip,resources([a('unknown',{entry_fee_numeric:null,duration_hours:null})]));const stop=plan.stops.find(s=>s.stop_type==='attraction');assert.equal(stop.cost,null);assert.equal(stop.duration_minutes,90);assert.match(stop.best_time_note,/planning estimate/);assert.match(stop.best_time_note,/Admission price unavailable/);assert.equal(plan.summary.cost_states['1:2'],'UNKNOWN');assert.equal(costDetails({...trip,generation_summary:plan.summary},plan.stops).categories.attractions.amount,null);
 assert.ok(plan.summary.optimization.candidates.every(c=>c.utilities.cost===0));
});
test('anonymous missing facts stay excluded and a preserved closure remains hard',()=>{
 assert.equal(visitPolicy(a('unknown',{source_url:null,entry_fee_numeric:null})).excluded,'entry_price_unknown');assert.equal(visitPolicy(a('saputara-museum')).excluded,'temporarily_closed');
 assert.throws(()=>buildPlan(trip,resources([a('saputara-museum')])),/No feasible/);
});
test('weekly, seasonal and second/fourth weekday closures are enforced',()=>{
 const item=a('x',{provenance_review:{planning:{closed_weekdays:[3],closed_from:'06-16',closed_through:'10-15',closed_month_weeks:[2,4],closed_month_weekday:6}}});
 assert.equal(isClosed(item,'2026-11-11',1),true);assert.equal(isClosed(item,'2026-11-10',1),false);assert.equal(isClosed(item,'2026-07-01',1),true);assert.equal(isClosed(item,'2026-11-14',1),true);
});
test('split operating windows never schedule across a published midday closure',()=>{
 const item=a('palace',{provenance_review:{planning:{windows:[[540,705],[900,1065]]}}});assert.equal(visitWindow(item,'2026-11-10',1,690,60).arrival,900);assert.equal(visitWindow(item,'2026-11-10',1,1050,60).closed,true);
});
test('midday sightseeing gets an unlocated unpriced personal break when no restaurant fits',()=>{
 const r=resources([a('a'),a('b',{opening_time:'14:00',closing_time:'18:00'})]);const plan=buildPlan(trip,r),lunch=plan.stops.find(s=>s.category==='lunch');assert.ok(lunch);assert.equal(lunch.reference_id,null);assert.equal(lunch.lat,null);assert.equal(lunch.lng,null);assert.equal(lunch.cost,null);assert.equal(lunch.duration_minutes,45);assert.ok(lunch.arrival_time>='12:00:00'&&lunch.departure_time<='14:00:00');assert.equal(plan.stops.filter(s=>s.stop_type==='attraction').length,2);
});
test('a cheap restaurant with a large detour is not forced into the route',()=>{
 const r=resources([a('a'),a('b',{opening_time:'14:00',closing_time:'18:00'})]);r.restaurants=[{id:'r',name:'Far restaurant',avg_cost_per_person:0,lat:23,lng:73}];r.routes.push(edge('h','r',100,150),edge('a','r',100,150),edge('b','r',100,150));const p=buildPlan(trip,r);assert.equal(p.stops.some(s=>s.reference_id==='r'),false);assert.ok(p.stops.some(s=>s.category==='lunch'&&s.reference_id===null));
});
test('four-day allocation uses distinct feasible visits and never labels hotel-only days complete',()=>{
 const p=buildPlan({...trip,trip_days:4,lodging_nights:3},resources(Array.from({length:8},(_,i)=>a('a'+i))));const visits=p.stops.filter(s=>s.stop_type==='attraction');assert.equal(visits.length,8);assert.equal(new Set(visits.map(s=>s.reference_id)).size,8);assert.ok(p.summary.day_coverage.every(d=>d.attraction_count===2));
 const sparse=buildPlan({...trip,trip_days:4,lodging_nights:3},resources([a('only')]));assert.equal(sparse.summary.day_coverage.filter(d=>d.status==='no_sightseeing_available').length,3);assert.ok(sparse.summary.day_coverage.filter(d=>!d.attraction_count).every(d=>d.optional_meals.length===0));
});
test('rural return allowance prevents a tour from running into the next day',()=>{
 const r=resources([a('far')]);r.routes=[edge('h','far',200,360)];assert.throws(()=>buildPlan({...trip,start_time:'12:00'},r),/No feasible/);
});

test('legacy cost-first requests do not reward an unknown fee as free',()=>{
 const p=buildPlan({...trip,weights:undefined,strategy:'budget-first'},resources([a('unknown',{entry_fee_numeric:null}),a('priced',{entry_fee_numeric:100})]));assert.equal(p.stops.find(s=>s.stop_type==='attraction').reference_id,'priced');
});

test('unreachable catalog rows do not inflate quotas and exhaust the usable pool before the last day',()=>{
 const r=resources(Array.from({length:8},(_,i)=>a('v'+i)));r.attractions.push(a('unreachable1'),a('unreachable2'));
 const p=buildPlan({...trip,trip_days:4,lodging_nights:3},r);assert.equal(p.stops.filter(s=>s.stop_type==='attraction').length,8);assert.ok(p.summary.day_coverage.every(d=>d.attraction_count===2));
});


test('versioned attraction package validates identity, provenance, uncertainty and route coordinates',()=>{
 const directory=new URL('../../data/attraction-20261020/',import.meta.url);
 const load=name=>JSON.parse(readFileSync(new URL(name,directory),'utf8'));
 const release=load('catalog-20261020.json'),original=load('source-catalog-context.json');
 assert.equal(release.records.length,56);
 const normalized=name=>name.toLowerCase().replace(/[^a-z0-9]/g,'');
 const keys=new Set(),identities=new Set(original.attractions.map(a=>a.destination_id+':'+normalized(a.name)));
 const coordinates=new Map(original.hotels.concat(original.attractions).map(a=>[a.external_id,[Number(a.lat),Number(a.lng)]]));
 for(const row of release.records){
  const v=row.values,city=original.destinations.find(c=>c.slug===row.city);assert.ok(city);
  assert.ok(!keys.has(row.key));keys.add(row.key);
  const identity=city.id+':'+normalized(v.name);assert.ok(!identities.has(identity),v.name+' duplicated');identities.add(identity);
  assert.ok(v.lat>=20&&v.lat<=25&&v.lng>=68&&v.lng<=75,v.name+' outside Gujarat region');
  assert.match(v.source_url,/^https:\/\//);assert.equal(v.source_date,'2026-10-20');
  assert.ok(v.provenance_review.sources.includes(v.source_url));
  assert.equal(v.entry_fee_numeric,null);assert.equal(v.rating,null);assert.equal(v.duration_hours,null);
  const planning=v.provenance_review.planning;assert.match(planning.duration_basis,/estimate/i);assert.ok(planning.duration_minutes>=15&&planning.duration_minutes<=600);
  for(const [open,close] of planning.windows??[])assert.ok(open>=0&&close<=1440&&open<close);
  assert.ok(['local_area','nearby_excursion'].includes(v.provenance_review.geography.scope));
  assert.ok(v.provenance_review.geography.coordinate_source.startsWith('https://'));
  assert.ok(!visitPolicy(v).excluded);coordinates.set(row.key,[v.lat,v.lng]);
 }
 const matrices=readdirSync(directory).filter(n=>/^routes-[a-z-]+-20261020\.json$/.test(n));assert.equal(matrices.length,8);
 for(const name of matrices){const data=load(name);assert.equal(data.response.code,'Ok');
  for(const node of data.nodes){const point=coordinates.get(node.external_id);if(point)assert.deepEqual([node.lat,node.lng],point,'Stale coordinate in '+name);}
 }
 assert.deepEqual(JSON.parse(readFileSync(new URL('../../frontend/public/catalog-attraction-20261020.json',import.meta.url),'utf8')),release);
});


test('a preserved unsourced legacy restaurant is not promoted to a verified meal stop',()=>{
 const r=resources([a('a'),a('b',{opening_time:'14:00',closing_time:'18:00'})]);
 r.restaurants=[{id:'r',external_id:'legacy-r',name:'Unverified legacy restaurant',avg_cost_per_person:1,lat:23,lng:72,source_url:null}];
 r.routes.push(edge('h','r'),edge('a','r'),edge('b','r'));
 const p=buildPlan(trip,r);assert.equal(p.stops.some(s=>s.reference_id==='r'),false);assert.ok(p.stops.some(s=>s.category==='lunch'&&s.reference_id===null));
});


test('unselected catalog alternatives do not mark a fully scheduled day incomplete',()=>{
 const r=resources([a('visit')]);r.attractions.push(a('unreachable-alternative'));
 const p=buildPlan(trip,r);assert.equal(p.summary.day_coverage[0].attraction_count,1);assert.equal(p.summary.status,'scheduled');assert.equal(p.summary.unscheduled_attractions.length,1);
});

test('the explanation explicitly identifies neutralized incomplete-cost comparisons',()=>{
 const provisional=buildPlan(trip,resources([a('unpriced',{entry_fee_numeric:null})]));assert.equal(provisional.summary.optimization.incomplete_costs_neutralized,true);
 const priced=buildPlan(trip,resources([a('known')]));assert.equal(priced.summary.optimization.incomplete_costs_neutralized,false);
});
