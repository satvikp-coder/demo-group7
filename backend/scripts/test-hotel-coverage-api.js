// Isolated catalog only: authenticated real HTTP and persisted plans for all tiers.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {createPool} from './database.js';
assert.match(new URL(process.env.DATABASE_URL).pathname,/^\/heritage_audit_[a-f0-9]+$/);
const pool=createPool(),base=process.env.API_TEST_URL;let token;
async function call(path,body,status=200){
 const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json();assert.equal(response.status,status,JSON.stringify({path,data}));return data;
}
const report={verified:false,results:[]};
try{
 const email='coverage-'+randomUUID()+'@example.test',password=randomBytes(24).toString('hex')+'Aa9!';
 await call('/auth/register',{name:'Isolated hotel coverage',email,password,role:'tourist'},201);token=(await call('/auth/login',{email,password})).token;
 for(const slug of ['ahmedabad','champaner','dwarka','gir-national-park','modhera','rann-of-kutch','saputara','somnath']){
  const destination=await call('/destinations/'+slug);
  for(const category of ['Low Cost','Budget','Premium']){
   const rows=await call('/destinations/'+slug+'/hotels?category='+encodeURIComponent(category));assert.ok(rows.length,slug+' '+category);
   assert.ok(rows.every(h=>h.hotel_category===category&&h.price_per_night>0&&h.distance_km>=0));
   const hotel=rows.find(h=>h.external_id?.startsWith('exp-20261011-'))??rows[0];
   for(const days of [1,3]){
    const input={destination_id:destination.id,starting_hotel_id:hotel.id,hotel_category:category,days,lodging_nights:days-1,rooms:1,travelers:2,budget:200000,start_time:slug==='gir-national-park'?'06:00':'08:00',start_date:'2026-11-10',weights:{distance:34,cost:33,rating:33}};
    const created=await call('/trips',input,201),result=await call('/trips/'+created.trip.id+'/generate-itinerary',{});
    const summary=result.trip.generation_summary,stops=result.days.flatMap(d=>d.stops),visits=stops.filter(s=>s.stop_type==='attraction');
    const minute=value=>Number(value.slice(0,2))*60+Number(value.slice(3,5));
    for(const day of result.days)for(let i=1;i<day.stops.length;i++)assert.ok(minute(day.stops[i].arrival_time)>=minute(day.stops[i-1].departure_time),'Schedule must not overlap');
    for(const gap of summary.free_time??[]){
     const day=result.days.find(d=>d.stops[0]?.day_number===gap.day_number),index=day.stops.findIndex(s=>s.stop_order===gap.before_stop_order),previous=day.stops[index-1],next=day.stops[index];
     const transfer=summary.legs.find(l=>l.day_number===gap.day_number&&l.from===previous.reference_id&&l.to===next.reference_id);
     assert.equal(gap.start_time,previous.departure_time);assert.equal(minute(gap.end_time),minute(next.arrival_time)-(transfer?.minutes??0));assert.equal(gap.duration_minutes,minute(gap.end_time)-minute(gap.start_time));assert.ok(gap.duration_minutes>=60);
    }
    assert.ok(visits.length,slug+' '+category+' '+days);assert.equal(result.trip.starting_hotel_id,hotel.id);
    assert.equal(summary.hotel_total,Number(hotel.price_per_night)*(days-1));assert.ok(Number(result.budget.total)<=input.budget);
    assert.equal(new Set(visits.map(s=>s.reference_id)).size,visits.length);assert.deepEqual(summary.optimization.weights,input.weights);
    const restored=await call('/trips/'+created.trip.id);assert.deepEqual(restored.budget,result.budget);
    report.results.push({slug,category,days,choices:rows.length,hotel:hotel.name,hotelId:hotel.id,distanceKm:hotel.distance_km,visits:visits.length,candidates:summary.optimization.evaluated_count,hotelTotal:summary.hotel_total,total:result.budget.total});
   }
  }
 }
 const destination=await call('/destinations/champaner'),hotel=(await call('/destinations/champaner/hotels?category=Low%20Cost'))[0];
 const input={destination_id:destination.id,starting_hotel_id:hotel.id,days:2,lodging_nights:1,travelers:1,rooms:1,budget:20000,start_time:'08:00'};
 const count=async()=>Number((await pool.query('SELECT count(*) FROM trips')).rows[0].count),before=await count();
 await call('/trips',input,422);assert.equal(await count(),before);
 await call('/trips',{...input,travelers:3},422);assert.equal(await count(),before);
 const accepted=await call('/trips',{...input,travelers:3,rooms:2},201);assert.equal(accepted.hotel_total,Number(hotel.price_per_night)*2);
 report.guestRestrictionsBeforeWrites=true;report.verified=true;
 console.log('Hotel coverage: all24 tiers /48 real generation-and-refresh cases and guest restrictions PASS');
}finally{await pool.end();writeFileSync(new URL('../../reports/hotel-tier-api-tests.json',import.meta.url),JSON.stringify(report,null,2));}
