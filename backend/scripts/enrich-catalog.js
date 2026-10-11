// Targeted existing-record corrections, never a reseed. Exact prior-value guard.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createPool} from './database.js';
const allowed=new Set(['entry_fee','entry_fee_numeric','duration_hours','opening_time','closing_time','best_time_note']);
const numeric=new Set(['entry_fee_numeric','duration_hours']);
const equivalent=(key,a,b)=>numeric.has(key)&&a!=null&&b!=null?Number(a)===Number(b):a===b;
export function loadEnrichment(){return JSON.parse(readFileSync(new URL('../../data/phase3/enrichment-20261011.json',import.meta.url),'utf8'));}
export async function applyEnrichment(pool,{dryRun=false,manifest=loadEnrichment()}={}){
 if(manifest.release!=='phase3-20261011'||!Array.isArray(manifest.records))throw new Error('Invalid enrichment release');
 const identities=new Set();
 for(const row of manifest.records){
  const keys=Object.keys(row.values??{});
  if(!row.slug||identities.has(row.slug)||!keys.length||keys.some(k=>!allowed.has(k)||!Object.hasOwn(row.expected??{},k))||!/^https:\/\//.test(row.source_url)||!/^\d{4}-\d{2}-\d{2}$/.test(row.checked))throw new Error('Invalid enrichment identity, field or source');
  identities.add(row.slug);
  for(const k of numeric)if(row.values[k]!=null&&(!Number.isFinite(row.values[k])||row.values[k]<0||(k==='duration_hours'&&row.values[k]===0)))throw new Error('Invalid enrichment numeric value');
 }
 const client=await pool.connect(),report={release:manifest.release,dryRun,updated:[],unchanged:[]};
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock($1)',[70072026]);
  for(const patch of manifest.records){
   const rows=(await client.query('SELECT a.* FROM attractions a JOIN destinations d ON d.id=a.destination_id WHERE a.slug=$1 AND d.slug=$2 FOR UPDATE OF a',[patch.slug,patch.city])).rows;
   if(rows.length!==1)throw new Error('Enrichment identity missing or ambiguous: '+patch.slug);
   const row=rows[0],keys=Object.keys(patch.values),hash=createHash('sha256').update(JSON.stringify(patch)).digest('hex');
   const prior=row.provenance_review??{},history=prior.enrichments??{};
   if(history[manifest.release]?.sha256===hash&&keys.every(k=>equivalent(k,row[k],patch.values[k]))){report.unchanged.push(patch.slug);continue;}
   if(history[manifest.release]||keys.some(k=>!equivalent(k,row[k],patch.expected[k])))throw new Error('Curated values changed; refusing overwrite: '+patch.slug);
   const provenance={...prior,enrichments:{...history,[manifest.release]:{sha256:hash,source_url:patch.source_url,checked:patch.checked,before:Object.fromEntries(keys.map(k=>[k,row[k]])),after:patch.values}}};
   await client.query('UPDATE attractions SET '+keys.map((k,i)=>k+'=$'+(i+1)).join(',')+',provenance_review=$'+(keys.length+1)+' WHERE id=$'+(keys.length+2),[...Object.values(patch.values),provenance,row.id]);
   report.updated.push(patch.slug);
  }
  await client.query(dryRun?'ROLLBACK':'COMMIT');return report;
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const pool=createPool();try{console.log(JSON.stringify(await applyEnrichment(pool,{dryRun:process.argv.includes('--dry-run')}),null,2));}catch(error){console.error(error.code??error.message);process.exitCode=1;}finally{await pool.end();}}
