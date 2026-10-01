import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import pg from '../backend/node_modules/pg/lib/index.js';
import {seedDatabase} from '../backend/scripts/seed.js';
import {loadSources} from '../backend/scripts/csvSource.js';
import jwt from '../backend/node_modules/jsonwebtoken/index.js';
const base=process.env.API_TEST_URL,pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:2});
const password='Aa1!'+randomBytes(24).toString('hex'),email='production-'+randomUUID()+'@example.test';
const report={checkedAt:new Date().toISOString(),verified:false,checks:[],load:[],cities:[]};
let id,token,triggerCreated=false;
async function api(path,{method='GET',body,auth=token,status=200}={}) {
 const response=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer '+auth}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
 assert.equal(response.status,status,path);return response.status===204?null:response.json();
}
function check(name){report.checks.push({name,passed:true});}
async function load(name,count,concurrency,action){
 const timings=[],statuses=[];let next=0;
 const begin=performance.now();
 await Promise.all(Array.from({length:concurrency},async()=>{while(next<count){const i=next++;const start=performance.now();try{await action(i);statuses.push('ok');}catch{statuses.push('failed');}timings.push(performance.now()-start);}}));
 timings.sort((a,b)=>a-b);
 const result={name,requests:count,concurrency,failures:statuses.filter(s=>s==='failed').length,p50Ms:Math.round(timings[Math.floor(count*.5)]),p95Ms:Math.round(timings[Math.min(count-1,Math.floor(count*.95))]),maxMs:Math.round(timings[count-1]),elapsedMs:Math.round(performance.now()-begin)};
 report.load.push(result);assert.equal(result.failures,0,name);
}
try {
 const signup=await api('/auth/register',{method:'POST',body:{name:'Production smoke',email,password,role:'tourist'},auth:null,status:201});id=signup.user.id;
 await api('/auth/register',{method:'POST',body:{name:'Privilege probe',email:'operator-'+email,password,role:'tour_operator'},auth:null,status:403});
 const session=await api('/auth/login',{method:'POST',body:{email,password},auth:null});token=session.token;
 check('Production register/login; operator signup forbidden');
 await api('/auth/register',{method:'POST',body:{name:'Duplicate',email,password},auth:null,status:409});
 await api('/auth/me',{auth:'invalid',status:401});
 const expired=jwt.sign({role:'tour_operator'},process.env.JWT_SECRET,{subject:id,expiresIn:-1});await api('/auth/me',{auth:expired,status:401});
 const forged=jwt.sign({role:'tour_operator'},randomBytes(32).toString('hex'),{subject:id,expiresIn:60});await api('/auth/me',{auth:forged,status:401});
 await api('/admin/status',{status:403});check('Invalid/expired/forged JWT; duplicate registration; tourist admin rejection');
 await api('/destinations/unknown-destination',{status:404});await api('/trips/'+randomUUID(),{status:404});
 await api('/destinations?limit=100000',{status:400});await api('/destinations/search?prefix='+encodeURIComponent('x'.repeat(200)),{status:400});
 check('Unknown IDs and numeric/string request limits');
 const cities=await api('/destinations?limit=100');assert.equal(cities.length,8);
 let firstTrip,firstPlan;
 for(const city of cities){
  const detail=await api('/destinations/'+city.id);
  const children={};for(const type of ['attractions','hotels','restaurants']){children[type]=await api('/destinations/'+city.id+'/'+type);assert.ok(children[type].length);assert.ok(children[type].every(r=>r.destination_id===city.id));}
  const created=await api('/trips',{method:'POST',body:{destination_id:city.id,days:2,budget:20000,starting_hotel_id:children.hotels[0].id,start_time:'08:00'},status:201});
  const plan=await api('/trips/'+created.trip.id+'/generate-itinerary',{method:'POST',body:{}});
  assert.deepEqual(await api('/trips/'+created.trip.id),plan);assert.deepEqual(await api('/trips/'+created.trip.id+'/budget'),plan.budget);
  const row=(await pool.query('SELECT sum(cost)::numeric AS total FROM itinerary_stops WHERE trip_id=$1',[created.trip.id])).rows[0];assert.equal(Number(row.total),plan.budget.total);
  report.cities.push({slug:city.slug,knownCost:plan.budget.total,status:plan.trip.generation_summary.status,visits:plan.days.flatMap(d=>d.stops).filter(s=>s.stop_type==='attraction').length});
  if(!firstTrip){firstTrip=created.trip.id;firstPlan=plan;}
 }
 check('All eight destination child/create/generate/persisted/budget flows; independent SQL sums');
 const unrelatedId=randomUUID();
 await pool.query("INSERT INTO destinations(id,name,slug) VALUES($1,$2,$3)",[unrelatedId,'Unrelated production fixture','unrelated-production-fixture']);
 const snapshot=async()=>{const result={};for(const table of ['users','trips','itinerary_stops','budgets'])result[table]=(await pool.query(`SELECT * FROM ${table} ORDER BY id`)).rows;return result;};
 const saved=await snapshot();
 const sources=await loadSources();await seedDatabase(pool,sources);await seedDatabase(pool,sources);
 assert.deepEqual(await snapshot(),saved);assert.equal((await pool.query('SELECT count(*)::int n FROM destinations WHERE id=$1',[unrelatedId])).rows[0].n,1);
 await pool.query('DELETE FROM destinations WHERE id=$1',[unrelatedId]);
 const owned=(await pool.query("SELECT id,description FROM attractions WHERE external_id='a101'")).rows[0];
 await pool.query('UPDATE attractions SET description=$2 WHERE id=$1',[owned.id,'Isolated operator edit preservation probe']);
 try {await assert.rejects(()=>seedDatabase(pool,sources),/managed catalog was edited/);}
 finally {await pool.query('UPDATE attractions SET description=$2 WHERE id=$1',[owned.id,owned.description]);}
 check('Reseed preserves users/trips/stops/budgets and unrelated catalog; operator edits cause refusal');
 const reverse=(await pool.query('SELECT count(*)::int n FROM routes WHERE reverse_distance_km IS NOT NULL')).rows[0].n;
 const asymmetric=(await pool.query('SELECT count(*)::int n FROM routes WHERE reverse_distance_km<>distance_km OR reverse_travel_time_minutes<>travel_time_minutes')).rows[0].n;
 report.directionalRoutes={reverseEvidence:reverse,asymmetric,unverifiedReverse:131-reverse};
 report.provenanceCounts={};for(const table of ['attractions','hotels','restaurants','routes'])report.provenanceCounts[table]=(await pool.query(`SELECT provenance_status,count(*)::int n FROM ${table} GROUP BY provenance_status`)).rows;
 report.queryPlans={};for(const [name,sql,values] of [
 ['destination-hotels','SELECT * FROM hotels WHERE destination_id=$1 ORDER BY price_per_night,id',[cities[0].id]],
 ['destination-routes','SELECT * FROM routes WHERE destination_id=$1 ORDER BY distance_km,travel_time_minutes,id',[cities[0].id]],
 ['persisted-stops','SELECT * FROM itinerary_stops WHERE trip_id=$1 ORDER BY day_number,stop_order',[firstTrip]]])report.queryPlans[name]=(await pool.query('EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) '+sql,values)).rows[0]['QUERY PLAN'];

 const competing=await Promise.all(Array.from({length:4},()=>api('/trips/'+firstTrip+'/generate-itinerary',{method:'POST',body:{}})));
 for(const plan of competing)assert.deepEqual(plan.days.map(d=>({...d,stops:d.stops.map(({id,...stop})=>stop)})),firstPlan.days.map(d=>({...d,stops:d.stops.map(({id,...stop})=>stop)})));
 const before=await api('/trips/'+firstTrip);
 assert.match(firstTrip,/^[a-f0-9-]{36}$/);
 await pool.query(`CREATE FUNCTION production_failure_probe() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.trip_id = '${firstTrip}'::uuid AND NEW.stop_order=2 THEN RAISE EXCEPTION 'Deliberate isolated transaction probe'; END IF; RETURN NEW; END $$`);
 await pool.query('CREATE TRIGGER production_failure_probe BEFORE INSERT ON itinerary_stops FOR EACH ROW EXECUTE FUNCTION production_failure_probe()');triggerCreated=true;
 const failure=await api('/trips/'+firstTrip+'/generate-itinerary',{method:'POST',body:{},status:500});assert.deepEqual(failure,{error:{message:'Internal server error'}});
 assert.deepEqual(await api('/trips/'+firstTrip),before);
 await pool.query('DROP TRIGGER production_failure_probe ON itinerary_stops');await pool.query('DROP FUNCTION production_failure_probe()');triggerCreated=false;
 check('Four simultaneous regenerations; halfway write failure rolls back old itinerary/budget intact');
 await load('search',40,8,()=>api('/destinations/search?prefix=Ah'));
 await load('destination',40,8,()=>api('/destinations/'+cities[0].id));
 await load('trip-retrieval',40,8,()=>api('/trips/'+firstTrip));
 await load('authentication',6,3,()=>api('/auth/login',{method:'POST',auth:null,body:{email,password}}));
 await load('itinerary-generation',8,2,()=>api('/trips/'+firstTrip+'/generate-itinerary',{method:'POST',body:{}}));
 report.databaseConnections=(await pool.query("SELECT state,count(*)::int AS count FROM pg_stat_activity WHERE application_name='heritage-planner' GROUP BY state")).rows;
 check('Bounded concurrent load with zero unexpected failures');
 // Demotion must override the signed role before the token expires.
 await pool.query("UPDATE users SET role='tour_operator' WHERE id=$1",[id]);
 const operator=await api('/auth/login',{method:'POST',auth:null,body:{email,password}});
 await api('/admin/status',{auth:operator.token});
 await pool.query("UPDATE users SET role='tourist' WHERE id=$1",[id]);await api('/admin/status',{auth:operator.token,status:403});
 check('Current database role revokes stale operator privileges');
 // Abuse boundary: deliberately reach the actual configured production limit.
 let blocked=false;
 for(let i=0;i<25;i++){
  const response=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  if(response.status===429){assert.ok(response.headers.get('retry-after'));blocked=true;break;}assert.equal(response.status,200);
 }
 assert.ok(blocked);check('Actual production authentication limiter enforces 429');
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{
 if(triggerCreated){await pool.query('DROP TRIGGER IF EXISTS production_failure_probe ON itinerary_stops');await pool.query('DROP FUNCTION IF EXISTS production_failure_probe()');}
 if(id)await pool.query('DELETE FROM users WHERE id=$1',[id]);
 await pool.end();writeFileSync(new URL('../backend/reports/production-api-smoke.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
