import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {pool} from '../config/database.js';
const city=process.argv[2]; const base=process.env.API_TEST_URL||'http://localhost:5000/api';
let token='',owner; const exchanges=[]; const report={city,checkedAt:new Date().toISOString(),exchanges};
async function request(method,path,body){const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});exchanges.push({method,path,status:response.status});const result=await response.json();assert.ok(response.ok,JSON.stringify(result));return result;}
try{
 const d=await request('GET','/destinations/'+city);
 const attractions=await request('GET',`/destinations/${d.id}/attractions`);
 const restaurants=await request('GET',`/destinations/${d.id}/restaurants`);
 let hotels;
 for(const sort of ['price','rating','value']) {const rows=await request('GET',`/destinations/${d.id}/hotels?sort=${sort}`);if(sort==='price'){hotels=rows;assert.ok(rows.every((r,i)=>!i||Number(rows[i-1].price_per_night)<=Number(r.price_per_night)));}}
 const credentials={email:`data-check-${randomUUID()}@example.test`,password:'Research!9'+randomUUID(),name:'Temporary data validation',role:'tourist'};
 const auth=await request('POST','/auth/register',credentials);owner=auth.user.id;token=(await request('POST','/auth/login',{email:credentials.email,password:credentials.password})).token;
 assert.ok(hotels.length,'No selectable hotel');
 const created=await request('POST','/trips',{destination_id:d.id,starting_hotel_id:hotels[0].id,days:2,budget:20000,start_time:'08:00',strategy:'distance-first',wheelchair_accessible_only:false});
 const generated=await request('POST',`/trips/${created.trip.id}/generate-itinerary`,{});
 assert.deepEqual(await request('GET',`/trips/${created.trip.id}`),generated);
 assert.deepEqual(await request('GET',`/trips/${created.trip.id}/budget`),generated.budget);
 report.counts={attractions:attractions.length,hotels:hotels.length,restaurants:restaurants.length};
 report.attractionVisits=generated.days.flatMap(d=>d.stops).filter(s=>s.stop_type==='attraction').length;
 report.summary=generated.trip.generation_summary;report.budget=generated.budget;report.apiPassed=true;
}catch(error){report.apiPassed=false;report.error=error.message;process.exitCode=1;}
finally{if(owner)await pool.query('DELETE FROM users WHERE id=$1',[owner]);await pool.end();report.cleanupCompleted=true;writeFileSync(new URL(`../reports/data-city-${city}.json`,import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({city,apiPassed:report.apiPassed,attractionVisits:report.attractionVisits,error:report.error}));}

