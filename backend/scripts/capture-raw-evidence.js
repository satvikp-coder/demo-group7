import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';
import { loadResearch } from './seed-research.js';

const folder=new URL('../reports/raw-evidence-2026-10-01/',import.meta.url);
mkdirSync(folder,{recursive:true});
let transcript='';
function out(s){process.stdout.write(s+'\n');transcript+=s+'\n';}
async function sql(query,params=[]){out('$ SQL '+query);if(params.length)out('PARAMETERS '+JSON.stringify(params));const result=await pool.query(query,params);out(JSON.stringify(result.rows));return result.rows;}
function curl(method,path,body,token,visible=true){
 const args=['-sS','--max-time','30','-i','-X',method,'http://localhost:5000'+path];
 if(body!==undefined)args.push('-H','Content-Type: application/json','--data-binary','@-');
 if(token)args.push('-H','Authorization: Bearer '+token);
 const result=spawnSync('curl.exe',args,{input:body===undefined?undefined:JSON.stringify(body),encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw new Error('curl exit '+result.status+': '+result.stderr);
 if(visible){out('$ curl.exe -sS --max-time 30 -i -X '+method+' http://localhost:5000'+path+(token?' -H "Authorization: Bearer $TEMP_TOKEN"':'')+(body===undefined?'':' -H "Content-Type: application/json" --data-binary @-'));if(body!==undefined)out('STDIN '+JSON.stringify(body));out(result.stdout);}
 const split=result.stdout.indexOf('\r\n\r\n')>=0?'\r\n\r\n':'\n\n';
 const raw=result.stdout.slice(result.stdout.indexOf(split)+split.length);
 return {status:Number(result.stdout.match(/^HTTP\/\S+ (\d+)/)?.[1]),body:raw.trim()?JSON.parse(raw):null};
}
const countQuery="SELECT 'destinations' AS table_name, COUNT(*) FROM destinations UNION ALL SELECT 'attractions', COUNT(*) FROM attractions UNION ALL SELECT 'hotels', COUNT(*) FROM hotels UNION ALL SELECT 'restaurants', COUNT(*) FROM restaurants UNION ALL SELECT 'routes', COUNT(*) FROM routes UNION ALL SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'trips', COUNT(*) FROM trips UNION ALL SELECT 'itinerary_stops', COUNT(*) FROM itinerary_stops UNION ALL SELECT 'budgets', COUNT(*) FROM budgets";
const users=[];let fixture;
try{
 if(process.argv[2]==='data'){
  const cities=['rann-of-kutch','gir-national-park','modhera','champaner','saputara'];
  for(const table of ['attractions','hotels','restaurants']){
   const raw=readFileSync(new URL('../../data/'+table+'.csv',import.meta.url),'utf8');
   const lines=raw.split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));
   out('data/'+table+'.csv');out(lines[0]);
   for(const city of cities){const matching=lines.slice(1).filter(x=>x.split(',')[1]===city);out(city+': '+matching.length+' rows');for(const row of matching)out(row);}
  }
  for(const city of cities){out('SUPPLEMENT '+city);for(const r of loadResearch(city).filter(r=>r.table!=='destinations'))out(JSON.stringify({table:r.table,key:r.key,values:r.values,evidence:r.evidence.source??r.evidence.name}));}
  for(const table of ['attractions','hotels','restaurants'])await sql(`SELECT d.slug AS city,r.external_id,r.name,r.source,r.source_url,r.source_date,r.provenance_status FROM ${table} r JOIN destinations d ON d.id=r.destination_id WHERE d.slug=ANY($1) ORDER BY d.slug,r.external_id`,[cities]);
  await sql(countQuery);
 }else{
  await sql(countQuery);
  curl('GET','/api/destinations');
  const modhera=(await sql("SELECT d.id AS destination_id,h.id AS hotel_id,h.name,h.price_per_night FROM destinations d JOIN hotels h ON h.destination_id=d.id WHERE d.slug='modhera'"))[0];
  curl('GET','/api/destinations/'+modhera.destination_id+'/hotels');
  const invented='never-registered-'+randomUUID()+'@example.test';
  await sql('SELECT COUNT(*) AS existing_accounts FROM users WHERE email=$1',[invented]);
  curl('POST','/api/auth/login',{email:invented,password:'Invented!NeverRegistered9'});
  async function account(role){const email='raw-evidence-'+randomUUID()+'@example.test',password='Evidence!Aa9'+randomUUID();const registration=curl('POST','/api/auth/register',{name:'Temporary raw evidence',email,password,role},undefined,false);if(registration.status!==201)throw new Error('Registration failed: '+JSON.stringify(registration.body));users.push(registration.body.user.id);const login=curl('POST','/api/auth/login',{email,password},undefined,false);if(login.status!==200)throw new Error('Fixture login failed');return login.body.token;}
  const tourist=await account('tourist'),operator=await account('tour_operator');
  curl('GET','/api/auth/me',undefined,tourist);
  fixture=randomUUID();const created=curl('POST','/api/admin/destinations/'+fixture,{name:'Temporary evidence destination',slug:'raw-evidence-'+fixture},operator,false);if(created.status!==201)throw new Error('Fixture destination creation failed');
  await sql('SELECT id,name FROM destinations WHERE id=$1',[fixture]);
  curl('DELETE','/api/admin/destinations/'+fixture,undefined,tourist);
  await sql('SELECT id,name FROM destinations WHERE id=$1',[fixture]);
  async function trip(hotel,budget){const request={destination_id:hotel.destination_id,days:1,budget,starting_hotel_id:hotel.hotel_id,start_time:'08:00',strategy:'distance-first',wheelchair_accessible_only:false};const create=curl('POST','/api/trips',request,tourist);if(create.status!==201)throw new Error('Trip creation failed');const id=create.body.trip.id;const generated=curl('POST','/api/trips/'+id+'/generate-itinerary',{},tourist);if(generated.status!==200)throw new Error('Generation failed');curl('GET','/api/trips/'+id+'/budget',undefined,tourist);
   await sql("SELECT s.trip_id,s.day_number,s.stop_order,s.stop_type,s.reference_id,s.name,s.cost,h.price_per_night AS catalog_hotel_nightly_price,a.entry_fee_numeric AS catalog_attraction_entry_price,r.avg_cost_per_person AS catalog_meal_price FROM itinerary_stops s LEFT JOIN hotels h ON s.stop_type='hotel' AND h.id=s.reference_id LEFT JOIN attractions a ON s.stop_type='attraction' AND a.id=s.reference_id LEFT JOIN restaurants r ON s.stop_type='meal' AND r.id=s.reference_id WHERE s.trip_id=$1 ORDER BY s.day_number,s.stop_order",[id]);
   await sql("SELECT t.id,t.budget,t.starting_hotel_id,t.trip_days,b.spent_hotel,b.spent_attractions,b.spent_meals,b.spent_transit,b.remaining,(SELECT SUM(cost) FROM itinerary_stops WHERE trip_id=t.id) AS actual_stop_total,t.generation_summary FROM trips t JOIN budgets b ON b.trip_id=t.id WHERE t.id=$1",[id]);
  }
  await trip(modhera,20000);
  const ahmedabad=(await sql("SELECT d.id AS destination_id,h.id AS hotel_id,h.name,h.price_per_night FROM destinations d JOIN hotels h ON h.destination_id=d.id WHERE d.slug='ahmedabad' ORDER BY h.price_per_night DESC"))[0];
  await trip(ahmedabad,6000);
 }
}finally{
 if(fixture)await pool.query('DELETE FROM destinations WHERE id=$1 AND slug=$2',[fixture,'raw-evidence-'+fixture]);
 for(const id of users)await pool.query("DELETE FROM users WHERE id=$1 AND email LIKE 'raw-evidence-%@example.test'",[id]);
 if(process.argv[2]!=='data'){out('AFTER EXACT-ID TEMPORARY FIXTURE CLEANUP');await sql(countQuery);}
 await pool.end();writeFileSync(new URL(process.argv[2]==='data'?'data.txt':'live.txt',folder),transcript);
}
