import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
assert.match(new URL(process.env.DATABASE_URL).pathname,/^\/heritage_audit_[a-f0-9]+$/);
const base=process.env.API_TEST_URL;let token;
async function call(path,body,status=200){
 const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return data;
}
const email='nights-'+randomUUID()+'@example.test',password=randomBytes(24).toString('hex')+'Aa9!';
await call('/auth/register',{name:'Isolated accommodation test',email,password,role:'tourist'},201);token=(await call('/auth/login',{email,password})).token;
const destination=await call('/destinations/ahmedabad'),hotel=(await call('/destinations/ahmedabad/hotels?category=Premium'))[0];
const baseInput={destination_id:destination.id,starting_hotel_id:hotel.id,days:1,budget:100000,travelers:2,start_time:'08:00',weights:{distance:34,cost:33,rating:33}};
for(const patch of [{lodging_nights:0},{days:2,lodging_nights:1},{days:3,lodging_nights:2,rooms:3},{days:2,arrival_date:'2026-10-10',departure_date:'2026-10-11'},{}]){
 const input={...baseInput,...patch},nights=patch.lodging_nights??(patch.arrival_date?1:input.days),rooms=patch.rooms??1;
 const created=await call('/trips',input,201);assert.equal(created.hotel_total,Number(hotel.price_per_night)*nights*rooms);
 const path='/trips/'+created.trip.id,result=await call(path+'/generate-itinerary',{});
 const hotelCosts=result.days.flatMap(d=>d.stops).filter(s=>s.stop_type==='hotel').reduce((s,r)=>s+Number(r.cost),0);
 assert.equal(hotelCosts,created.hotel_total);assert.equal(result.trip.generation_summary.lodging_nights,nights);
 const restored=await call(path);assert.equal(restored.trip.lodging_nights,patch.lodging_nights??(patch.arrival_date?1:null));assert.deepEqual(restored.budget,result.budget);
}
for(const patch of [{lodging_nights:3},{lodging_nights:-1},{arrival_date:'2026-10-10'},{arrival_date:'2026-10-11',departure_date:'2026-10-10'},{lodging_nights:0,arrival_date:'2026-10-10',departure_date:'2026-10-11'}])await call('/trips',{...baseInput,...patch},400);
console.log('Phase2 accommodation API: 5 generation/persistence scenarios and 5 invalid-input cases PASS');

const unknown=(await call('/destinations/ahmedabad/hotels')).find(h=>h.price_per_night==null);
assert.ok(unknown);
await call('/trips',{...baseInput,starting_hotel_id:unknown.id,lodging_nights:1},422);
const anchorOnly=await call('/trips',{...baseInput,starting_hotel_id:unknown.id,lodging_nights:0},201);assert.equal(anchorOnly.hotel_total,0);
const coverage=[];
for(const slug of ['ahmedabad','champaner','dwarka','gir-national-park','modhera','rann-of-kutch','saputara','somnath']){
 const destination=await call('/destinations/'+slug),hotels=await call('/destinations/'+slug+'/hotels');
 const categories={};
 for(const category of ['Low Cost','Budget','Premium']){
  const rows=await call('/destinations/'+slug+'/hotels?category='+encodeURIComponent(category));
  assert.ok(rows.every(h=>h.hotel_category===category&&h.distance_km>=0));categories[category]=rows.length;
 }
 const hotel=hotels.find(h=>h.price_per_night!=null);assert.ok(hotel,'Original known-price hotel remains available');
 const scenarios=[];
 for(const [days,weights] of [[1,{distance:80,cost:10,rating:10}],[1,{distance:10,cost:80,rating:10}],[1,{distance:10,cost:10,rating:80}],[3,{distance:34,cost:33,rating:33}]]){
  const input={...baseInput,destination_id:destination.id,starting_hotel_id:hotel.id,days,lodging_nights:days-1,start_date:'2026-10-12',weights};
  const created=await call('/trips',input,201),result=await call('/trips/'+created.trip.id+'/generate-itinerary',{});
  const summary=result.trip.generation_summary,visits=result.days.flatMap(d=>d.stops).filter(s=>s.stop_type==='attraction');
  assert.ok(visits.length);assert.equal(new Set(visits.map(s=>s.reference_id)).size,visits.length);assert.ok(Number(result.budget.total)<=input.budget);
  assert.equal(summary.hotel_total,Number(hotel.price_per_night)*(days-1));assert.deepEqual(summary.optimization.weights,weights);
  scenarios.push({days,weights,visits:visits.length,evaluated:summary.optimization.evaluated_count,total:result.budget.total});
 }
 coverage.push({slug,categories,scenarios});
}
writeFileSync(new URL('../../reports/phase2-cross-destination-tests.json',import.meta.url),JSON.stringify({verified:true,coverage},null,2));
console.log('All 8 destinations: category isolation and 32 real generation scenarios PASS');
