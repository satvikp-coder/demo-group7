import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
assert.match(new URL(process.env.DATABASE_URL).pathname,/^\/heritage_audit_[a-f0-9]+$/);
const base=process.env.API_TEST_URL;let token;
async function call(path,body,status=200){
 const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return data;
}
const email='phase3-safari-'+randomUUID()+'@example.test',password=randomBytes(24).toString('hex')+'Aa9!';
await call('/auth/register',{name:'Isolated safari regression',email,password,role:'tourist'},201);
token=(await call('/auth/login',{email,password})).token;
const destination=await call('/destinations/gir-national-park'),hotels=await call('/destinations/gir-national-park/hotels');
const hotel=hotels.find(h=>h.price_per_night!=null),safari=destination.attractions?.find(a=>a.slug==='gir-jungle-safari')??(await call('/destinations/gir-national-park/attractions')).find(a=>a.slug==='gir-jungle-safari');
assert.ok(hotel&&safari);
const cases=[];
for(const [date,travelers,expected] of [['2026-10-19',3,4700],['2026-10-19',7,9400],['2026-10-17',3,4900],['2026-10-12',3,null]]){
 const input={destination_id:destination.id,starting_hotel_id:hotel.id,days:1,lodging_nights:0,budget:30000,start_time:'08:00',start_date:date,travelers,weights:{distance:100,cost:0,rating:0}};
 const created=await call('/trips',input,201),path='/trips/'+created.trip.id;
 const result=await call(path+'/generate-itinerary',{}),visit=result.days.flatMap(d=>d.stops).find(s=>s.reference_id===safari.id);
 if(expected===null)assert.equal(visit,undefined,'Seasonal closure must exclude Gir jungle safari');
 else{assert.ok(visit,'An open safari must remain reachable in this known-route fixture');assert.equal(Number(visit.cost),expected);assert.ok(['09:00:00','15:00:00'].includes(visit.arrival_time));assert.match(visit.best_time_note,/six-seat/);}
 assert.deepEqual((await call(path)).budget,result.budget);cases.push({date,travelers,expectedSafariCost:expected,actualSafariCost:visit?Number(visit.cost):null,persisted:true});
}
writeFileSync(new URL('../../reports/phase3-safari-api-tests.json',import.meta.url),JSON.stringify({verified:true,cases},null,2));
console.log('Phase3 actual PostgreSQL/API safari unit, group capacity, weekend price, closure and persistence: 4 PASS');
