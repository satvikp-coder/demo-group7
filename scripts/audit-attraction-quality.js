import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {localArgs,localRoot,localEnvironment} from './local-stack.js';
import {buildPlan} from '../backend/services/tripPlanner.js';
import {visitPolicy} from '../backend/services/attractionPlanning.js';
import {costDetails} from '../backend/services/costStatus.js';
import {hotelPriceView} from '../dsa/planning/hotelPolicy.ts';
const env=localEnvironment();
export function sql(query,database='heritage_planner'){
 const raw=execFileSync('docker',[...localArgs,'exec','-T','postgres','psql','-U','heritage_owner','-d',database,'-At','-v','ON_ERROR_STOP=1','-c',query],{cwd:localRoot,env,encoding:'utf8',windowsHide:true,maxBuffer:20000000});
 return JSON.parse(raw.slice(raw.indexOf('['),raw.lastIndexOf(']')+1));
}
const tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets'];
const fingerprints=db=>Object.fromEntries(tables.map(t=>[t,sql(`SELECT coalesce(json_agg(r),'[]') FROM (SELECT id,md5(to_jsonb(t)::text) hash FROM ${t} t ORDER BY id) r`,db)]));
const phase=process.argv.includes('--before')?'before':'after';
if(phase==='before'){
 const original=fingerprints();writeFileSync(new URL('../backups/attraction-original-digests.json',import.meta.url),JSON.stringify(original));
 const restored=fingerprints('local_restore_attraction_20261020');if(JSON.stringify(original)!==JSON.stringify(restored))throw Error('Backup restore does not match original rows');
}
const snapshot=Object.fromEntries(tables.slice(0,5).map(t=>[t,sql(`SELECT coalesce(json_agg(t),'[]') FROM ${t} t`)]));
if(phase==='before')writeFileSync(new URL('../backups/attraction-catalog-before.json',import.meta.url),JSON.stringify(snapshot));
const report={checkedAt:new Date().toISOString(),phase,readOnly:true,catalog_counts:Object.fromEntries(Object.entries(snapshot).map(([k,v])=>[k,v.length])),usable_indicative_hotel_prices:snapshot.hotels.map(hotelPriceView).filter(h=>h.price_per_night!=null).length,stored_attraction_fees:snapshot.attractions.filter(a=>a.entry_fee_numeric!=null).length,stored_attraction_ratings:snapshot.attractions.filter(a=>a.rating!=null).length,destinations:[]};
for(const city of snapshot.destinations.sort((a,b)=>a.name.localeCompare(b.name))){
 const attractions=snapshot.attractions.filter(a=>a.destination_id===city.id),restaurants=snapshot.restaurants.filter(a=>a.destination_id===city.id),routes=snapshot.routes.filter(a=>a.destination_id===city.id);
 const hotels=snapshot.hotels.filter(h=>h.destination_id===city.id).map(hotelPriceView).filter(h=>h.price_per_night!=null&&(!h.provenance_review?.booking_conditions?.minimum_guests||h.provenance_review.booking_conditions.minimum_guests<=2)&&(!h.provenance_review?.booking_conditions?.priced_guests_per_room||h.provenance_review.booking_conditions.priced_guests_per_room>=2)).sort((a,b)=>a.price_per_night-b.price_per_night);
 const hotel=city.slug==='rann-of-kutch'?hotels.find(h=>/Prince Residency/i.test(h.name))??hotels[0]:hotels[0];
 const metrics={planning_exclusions:attractions.filter(a=>visitPolicy(a).excluded).map(a=>({id:a.id,name:a.name,reason:visitPolicy(a).excluded})),published_window_records:attractions.filter(a=>(a.opening_time&&a.closing_time)||a.provenance_review?.planning?.windows?.length).length,route_records:routes.length,planning_candidates:attractions.filter(a=>!visitPolicy(a).excluded).length,estimated_durations:attractions.filter(a=>a.duration_hours==null&&!visitPolicy(a).excluded).length,weekly_closure_records:attractions.filter(a=>a.provenance_review?.planning?.closed_weekdays?.length).length,id:city.id,name:city.name,slug:city.slug,records:attractions.length,valid_coordinates:attractions.filter(a=>a.lat!=null&&a.lng!=null&&Number.isFinite(Number(a.lat))&&Number.isFinite(Number(a.lng))).length,known_fees:attractions.filter(a=>a.entry_fee_numeric!=null).length,known_durations:attractions.filter(a=>a.duration_hours!=null).length,known_hours:attractions.filter(a=>a.opening_time&&a.closing_time).length,legacy_eligible:attractions.filter(a=>a.entry_fee_numeric!=null&&a.duration_hours!=null).length,connected:attractions.filter(a=>routes.some(r=>r.source_node_id===a.id||r.destination_node_id===a.id)).length,attractions:attractions.map(a=>({name:a.name,id:a.id,slug:a.slug,fee:a.entry_fee_numeric,duration:a.duration_hours,lat:a.lat,lng:a.lng,source_url:a.source_url})),scenarios:[]};
 for(let days=1;days<=4;days++){
  try{const plan=buildPlan({trip_days:days,budget:100000,start_time:'08:00',strategy:'balanced',weights:{distance:34,cost:33,rating:33},travelers:2,rooms:1,lodging_nights:days-1,start_date:'2026-11-10'}, {hotel,attractions,restaurants,routes});const visits=plan.stops.filter(s=>s.stop_type==='attraction'),detail=costDetails({trip_days:days,travelers:2,rooms:1,lodging_nights:days-1,generation_summary:plan.summary},plan.stops);metrics.scenarios.push({days,hotel:hotel.name,meal_breaks:plan.stops.filter(s=>s.stop_type==='meal').length,unknown_stop_costs:plan.stops.filter(s=>s.cost==null).length,unpriced_components:detail.unknown_components,complete_budget:detail.complete,attraction_count:visits.length,duplicates:visits.length-new Set(visits.map(s=>s.reference_id)).size,sightseeing_days:plan.summary.day_coverage.filter(d=>d.attraction_count).length,empty_days:plan.summary.day_coverage.filter(d=>!d.attraction_count).length,candidates:plan.summary.optimization?.evaluated_count,known_subtotal:plan.stops.reduce((n,s)=>n+(Number(s.cost)||0),0),distance_km:plan.summary.legs.reduce((n,l)=>n+l.distance_km,0),exclusions:plan.summary.excluded_attractions,day_coverage:plan.summary.day_coverage});}catch(e){metrics.scenarios.push({days,hotel:hotel?.name,failure:e.message});}
 }
 report.destinations.push(metrics);
}
if(phase==='after'){
 const original=JSON.parse(readFileSync(new URL('../backups/attraction-original-digests.json',import.meta.url),'utf8')),current=fingerprints();
 report.preservation=tables.map(t=>({table:t,original:original[t].length,current:current[t].length,preserved:original[t].every(r=>current[t].some(c=>c.id===r.id&&c.hash===r.hash))}));if(report.preservation.some(r=>!r.preserved))throw Error('Original record changed');
}
writeFileSync(new URL('../reports/attraction-coverage-'+phase+'.json',import.meta.url),JSON.stringify(report,null,2));
const lines=['# Attraction coverage '+phase,'','Actual PostgreSQL and existing planner; 10 November 2026, two travelers, one room, INR100000 known-budget ceiling. Active flag is not modeled; eligibility and dated closures are evaluated by the actual engine. Backup restored and all original row digests compared before editing.','','| Destination | Records | Eligible under old fee/duration policy | Valid locations | Known fees | Durations | Hours | Connected | 4-day sightseeing / requested |','|---|---:|---:|---:|---:|---:|---:|---:|---|'];
for(const d of report.destinations)lines.push(`| ${d.name} | ${d.records} | ${d.legacy_eligible} | ${d.valid_coordinates} | ${d.known_fees} | ${d.known_durations} | ${d.known_hours} | ${d.connected} | ${d.scenarios[3].sightseeing_days??'failed'} /4 |`);
lines.push('','Exclusion details, real UUIDs, candidate counts and one-to-four-day results: `attraction-coverage-'+phase+'.json`. Costs, hours and route connectivity are not independently certified by counts. Missing facts are not assumed free/open.');
writeFileSync(new URL('../reports/ATTRACTION_COVERAGE_'+phase.toUpperCase()+'.md',import.meta.url),lines.join('\n'));
console.log(JSON.stringify(report.destinations.map(({attractions,scenarios,...d})=>({...d,four_days:scenarios[3]}))));
