import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createPool} from './database.js';
import {researchDirectory,equalValue} from './seed-research.js';
export function loadResearchRoutes(city) {
 const result=[];
 for(const file of readdirSync(researchDirectory).filter(f=>/^routes-[a-z-]+\.json$/.test(f))) {
  const snapshot=JSON.parse(readFileSync(new URL(file,researchDirectory),'utf8'));
  if(city&&snapshot.city!==city)continue;
  let overrides=[];try{overrides=JSON.parse(readFileSync(new URL('route-overrides-'+snapshot.city+'.json',researchDirectory),'utf8')).routes;}catch(e){if(e.code!=='ENOENT')throw e;}
  if(snapshot.response.code!=='Ok'||!snapshot.checked||!snapshot.source_url)throw new Error('Invalid routing snapshot '+file);
  const nodes=snapshot.nodes;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++) {
   const a=nodes[i],b=nodes[j];if(a.kind==='hotel'&&b.kind==='hotel')continue;
   const override=overrides.find(r=>[r.from,r.to].includes(a.external_id)&&[r.from,r.to].includes(b.external_id));
   if(override) {
    if(!override.source_url||!override.evidence||!override.checked)throw new Error('Missing route evidence');
    const evidence=JSON.parse(readFileSync(new URL(override.evidence,researchDirectory),'utf8'));
    if(evidence.requested!==override.source_url)throw new Error('Route source differs from archived request');
   }
   const metres=override?override.distance_km*1000:snapshot.response.distances[i][j],seconds=override?override.travel_time_minutes*60:snapshot.response.durations[i][j];
   if(!Number.isFinite(metres)||!Number.isFinite(seconds)||metres<=0||seconds<=0)continue;
   if(!override&&(snapshot.response.sources[i].distance>250||snapshot.response.sources[j].distance>250))continue;
   const reverseMetres = override ? null : snapshot.response.distances[j][i];
   const reverseSeconds = override ? null : snapshot.response.durations[j][i];
   const reverseValid = Number.isFinite(reverseMetres) && Number.isFinite(reverseSeconds) && reverseMetres > 0 && reverseSeconds > 0;
   result.push({city:snapshot.city,from:a,to:b,values:{reverse_distance_km:reverseValid?Math.round(reverseMetres/10)/100:null,reverse_travel_time_minutes:reverseValid?Math.ceil(reverseSeconds/60):null,distance_km:Math.round(metres/10)/100,travel_time_minutes:Math.ceil(seconds/60),transport_mode:'road',source:override?override.notes:'OSRM driving / OpenStreetMap; rounded km and ceiling minutes; no live traffic or fares',source_url:override?.source_url??snapshot.source_url,source_date:override?.checked??snapshot.checked,provenance_status:'project_approved',source_row_hash:createHash('sha256').update(JSON.stringify([a.external_id,b.external_id,metres,seconds,snapshot.checked])).digest('hex')}});
  }
 }
 return result;
}
export async function resolveResearchRoute(client,route) {
 const destination=(await client.query('SELECT id FROM destinations WHERE slug=$1',[route.city])).rows[0];
 if(!destination)throw new Error('Missing route city '+route.city);
 const nodes=[];
 for(const n of [route.from,route.to]) {
  if(!['attraction','hotel','restaurant'].includes(n.kind))throw new Error('Invalid endpoint type');
  const row=(await client.query(`SELECT * FROM ${n.kind}s WHERE external_id=$1 AND destination_id=$2`,[n.external_id,destination.id])).rows[0];
  if(!row||Number(row.lat)!==Number(n.lat)||Number(row.lng)!==Number(n.lng))throw new Error('Stale endpoint coordinates: '+n.external_id);
  nodes.push(row);
 }
 return {destination,nodes};
}
export async function applyResearchRoutes(client,city) {
 let inserted=0;
 for(const route of loadResearchRoutes(city)) {
  const {destination,nodes:[a,b]}=await resolveResearchRoute(client,route);
  const old=(await client.query('SELECT * FROM routes WHERE source_node_id=$1 AND destination_node_id=$2 AND transport_mode=$3',[a.id,b.id,'road'])).rows[0];
  if(old){
   if(old.reverse_distance_km === null && route.values.reverse_distance_km !== null) {
    await client.query('UPDATE routes SET reverse_distance_km=$2, reverse_travel_time_minutes=$3 WHERE id=$1',[old.id,route.values.reverse_distance_km,route.values.reverse_travel_time_minutes]);
    old.reverse_distance_km=route.values.reverse_distance_km; old.reverse_travel_time_minutes=route.values.reverse_travel_time_minutes;
   }
   for(const [field,value]of Object.entries(route.values))if(!equalValue(old[field],value))throw new Error('Existing route differs from research; review explicitly: '+route.from.external_id+' / '+route.to.external_id+' '+field);
   continue;
  }
  const values={destination_id:destination.id,['source_'+route.from.kind+'_id']:a.id,['destination_'+route.to.kind+'_id']:b.id,...route.values};
  const fields=Object.keys(values);
  await client.query(`INSERT INTO routes(${fields.join(',')}) VALUES(${fields.map((_,i)=>'$'+(i+1)).join(',')})`,Object.values(values));inserted++;
 }
 return inserted;
}
async function main(){
 if(process.env.NODE_ENV === "production")throw new Error("Use the guarded npm run db:seed pipeline in production");
 const city=process.argv[2];if(!/^[a-z-]+$/.test(city??''))throw new Error('City slug required');
 const pool=createPool(),client=await pool.connect();
 try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock($1)',[70072026]);const inserted=await applyResearchRoutes(client,city);await client.query('COMMIT');console.log(JSON.stringify({city,inserted}));}
 catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.code??e.message);process.exitCode=1;});
