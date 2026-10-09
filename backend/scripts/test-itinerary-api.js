// This script must only receive the disposable itinerary-runner database.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {createPool} from './database.js';
const pool=createPool(),checks=[];
assert.match(new URL(process.env.DATABASE_URL).pathname,/^\/heritage_audit_[a-f0-9]+$/);
const base=process.env.API_TEST_URL,weights={distance:34,cost:33,rating:33};
let token;
async function call(path,body,status=200){
 const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;
}
try{
 const email='matrix-'+randomUUID()+'@example.test',password=randomBytes(24).toString('hex')+'Aa9!';
 await call('/auth/register',{name:'Isolated matrix',email,password,role:'tourist'},201);token=(await call('/auth/login',{email,password})).token;
 const destination=await call('/destinations/ahmedabad');const hotel=(await call('/destinations/ahmedabad/hotels?category=Premium'))[0];
 const input={destination_id:destination.id,starting_hotel_id:hotel.id,hotel_category:'Premium',days:1,budget:30000,start_time:'08:00',weights};
 for(const [label,patch,status] of [
  ['Invalid destination',{destination_id:randomUUID()},404],['Invalid hotel',{starting_hotel_id:randomUUID()},422],
  ['Category mismatch',{hotel_category:'Low Cost'},422],['Invalid total',{weights:{distance:90,cost:90,rating:0}},400],
  ['Fractional weights',{weights:{distance:34.5,cost:32.5,rating:33}},400],['Missing weight',{weights:{distance:100}},400],
  ['Extra weight',{weights:{distance:100,cost:0,rating:0,fake:0}},400],['Invalid travelers',{travelers:0},400],
  ['Invalid rooms',{rooms:21},400],['Invalid calendar date',{start_date:'2026-02-30'},400],
 ]){await call('/trips',{...input,...patch},status);checks.push(label+' rejected');}
 const low=await call('/trips',{...input,budget:1},201);await call('/trips/'+low.trip.id+'/generate-itinerary',{},422);checks.push('Tight budget returns honest infeasibility');
 const created=await call('/trips',input,201);const path='/trips/'+created.trip.id+'/generate-itinerary';
 const result=await call(path,{});assert.ok(result.days.some(d=>d.stops.some(s=>s.stop_type==='attraction')));
 assert.equal(result.budget.total,result.days.flatMap(d=>d.stops).reduce((sum,s)=>sum+Number(s.cost),0));
 checks.push('Real IDs, candidate retrieval and persisted budget agree');
 try{
  await pool.query('UPDATE hotels SET price_per_night=NULL WHERE id=$1',[hotel.id]);await call('/trips',input,422);checks.push('Missing price is rejected, never free');
  await pool.query('UPDATE hotels SET price_per_night=1000 WHERE id=$1',[hotel.id]);await call(path,{},422);checks.push('Changed hotel/category rejected on regeneration');
 }finally{await pool.query('UPDATE hotels SET price_per_night=$2 WHERE id=$1',[hotel.id,hotel.price_per_night]);}
 try{
  await pool.query('UPDATE hotels SET lat=24 WHERE id=$1',[hotel.id]);await call(path,{},422);checks.push('Coordinate change invalidates archived OSRM routes');
 }finally{await pool.query('UPDATE hotels SET lat=$2 WHERE id=$1',[hotel.id,hotel.lat]);}
 const connection=await pool.connect();
 try{
  await connection.query('BEGIN');
  for(const value of [{distance:100},{distance:100,cost:0,rating:0,extra:0},{distance:34.5,cost:32.5,rating:33},{distance:101,cost:0,rating:-1}]){
   await connection.query('SAVEPOINT invalid_weights');let rejected=false;
   try{await connection.query('UPDATE trips SET weights=$2 WHERE id=$1',[created.trip.id,value]);}catch(e){assert.equal(e.code,'23514');rejected=true;}
   await connection.query('ROLLBACK TO SAVEPOINT invalid_weights');assert.ok(rejected,'Database must reject invalid weights');
  }
  await connection.query('ROLLBACK');checks.push('Database rejects missing/extra/fractional/out-of-range weights');
 }finally{connection.release();}
 const stable=await call(path,{});const repeated=await Promise.all(Array.from({length:3},()=>call(path,{})));
 const schedule=dto=>dto.days.map(d=>({...d,stops:d.stops.map(({id,...stop})=>stop)}));
 for(const dto of repeated)assert.deepEqual(schedule(dto),schedule(stable));
 checks.push('Concurrent generation atomically preserves stable stops');
 writeFileSync(new URL('../../reports/itinerary-api-matrix.json',import.meta.url),JSON.stringify({verified:true,checks},null,2));console.log(JSON.stringify({verified:true,checks}));
}finally{await pool.end();}
