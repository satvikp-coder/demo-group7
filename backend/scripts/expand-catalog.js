// Additive, transactionally validated catalog release. Never updates/deletes existing records.
import {readFileSync,readdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createPool} from './database.js';
const directory=new URL('../../data/expansion/',import.meta.url);
const fields=new Set(['slug','name','lat','lng','rating','source','source_url','source_date','provenance_status','image_url','provenance_review','stay_type','price_per_night','location','description','category','entry_fee','entry_fee_numeric','duration_hours','opening_time','closing_time','best_time_note']);
export function loadExpansion(){
 const manifest=JSON.parse(readFileSync(new URL('catalog-20261009.json',directory),'utf8'));
 const keys=new Set();
 for(const r of manifest.records){
  if(!['hotels','attractions'].includes(r.table)||!['ahmedabad','somnath'].includes(r.city)||!/^exp-20261009-[a-z0-9-]+$/.test(r.key)||keys.has(r.key))throw new Error('Invalid or duplicate expansion identity');keys.add(r.key);
  const v=r.values;if(!v.name||!v.slug||!v.source_url?.startsWith('https://')||!v.provenance_review?.sources?.length||Object.keys(v).some(k=>!fields.has(k)))throw new Error('Missing provenance or unsupported field');
  if(!Number.isFinite(v.lat)||v.lat<20||v.lat>25||!Number.isFinite(v.lng)||v.lng<68||v.lng>75)throw new Error('Expansion coordinates outside Gujarat bounds');
  for(const key of ['rating','price_per_night','entry_fee_numeric','duration_hours'])if(v[key]!=null&&(!Number.isFinite(v[key])||v[key]<0))throw new Error('Invalid factual numeric value');
 }
 return manifest;
}
export async function applyExpansion(pool,{dryRun=false}={}){
 const catalog=loadExpansion(),client=await pool.connect(),report={release:'20261009',dryRun,inserted:[],preserved:[],routesInserted:0};
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock($1)',[70072026]);
  for(const r of catalog.records){
   const d=(await client.query('SELECT id FROM destinations WHERE slug=$1',[r.city])).rows[0];if(!d)throw new Error('Missing expansion destination');
   const existing=(await client.query(`SELECT id,destination_id FROM ${r.table} WHERE external_id=$1 OR slug=$2 OR (destination_id=$3 AND lower(name)=lower($4))`,[r.key,r.values.slug,d.id,r.values.name])).rows;
   if(existing.length){report.preserved.push({key:r.key,reason:'Existing identity/name/slug preserved without overwriting'});continue;}
   const values={external_id:r.key,destination_id:d.id,...r.values},columns=Object.keys(values);
   const row=(await client.query(`INSERT INTO ${r.table} (${columns.join(',')}) VALUES (${columns.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING id`,Object.values(values))).rows[0];report.inserted.push({table:r.table,key:r.key,id:row.id});
  }
  for(const file of readdirSync(directory).filter(f=>/^routes-[a-z]+-20261009\.json$/.test(f))){
   const s=JSON.parse(readFileSync(new URL(file,directory),'utf8'));if(s.response.code!=='Ok')throw new Error('Invalid route evidence');
   const d=(await client.query('SELECT id FROM destinations WHERE slug=$1',[s.city])).rows[0];const nodes=[];
   for(const n of s.nodes){
    if(!['hotel','attraction','restaurant'].includes(n.kind))throw new Error('Invalid endpoint kind');
    const row=(await client.query(`SELECT id,lat,lng FROM ${n.kind}s WHERE external_id=$1 AND destination_id=$2`,[n.external_id,d.id])).rows[0];
    if(!row||Number(row.lat)!==Number(n.lat)||Number(row.lng)!==Number(n.lng))throw new Error('Route endpoint missing or changed coordinates: '+n.external_id);nodes.push(row);
   }
   for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const a=s.nodes[i],b=s.nodes[j];if(!(a.external_id.startsWith('exp-')||b.external_id.startsWith('exp-'))||(a.kind==='hotel'&&b.kind==='hotel'))continue;
    if(s.response.sources[i].distance>250||s.response.sources[j].distance>250)continue;
    const [metres,seconds,reverseMetres,reverseSeconds]=[s.response.distances[i][j],s.response.durations[i][j],s.response.distances[j][i],s.response.durations[j][i]];
    if(![metres,seconds,reverseMetres,reverseSeconds].every(v=>Number.isFinite(v)&&v>0))continue;
    const old=(await client.query('SELECT id FROM routes WHERE (source_node_id=$1 AND destination_node_id=$2) OR (source_node_id=$2 AND destination_node_id=$1)',[nodes[i].id,nodes[j].id])).rows[0];if(old)continue;
    const values={destination_id:d.id,['source_'+a.kind+'_id']:nodes[i].id,['destination_'+b.kind+'_id']:nodes[j].id,distance_km:Math.max(.01,Math.round(metres/10)/100),travel_time_minutes:Math.ceil(seconds/60),reverse_distance_km:Math.max(.01,Math.round(reverseMetres/10)/100),reverse_travel_time_minutes:Math.ceil(reverseSeconds/60),transport_mode:'road',source:'OSRM driving / OpenStreetMap modelled estimates; no live traffic or fares',source_url:s.source_url,source_date:s.checked,provenance_status:'project_approved',source_row_hash:createHash('sha256').update(JSON.stringify([a,b,metres,seconds,reverseMetres,reverseSeconds])).digest('hex')},columns=Object.keys(values);
    await client.query(`INSERT INTO routes (${columns.join(',')}) VALUES (${columns.map((_,k)=>'$'+(k+1)).join(',')})`,Object.values(values));report.routesInserted++;
   }
  }
  await client.query(dryRun?'ROLLBACK':'COMMIT');return report;
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const pool=createPool();try{console.log(JSON.stringify(await applyExpansion(pool,{dryRun:process.argv.includes('--dry-run')}),null,2));}catch(e){console.error(e.code??e.message);process.exitCode=1;}finally{await pool.end();}}
