// Field-level researched supplements for the existing seed pipeline.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createPool } from './database.js';
export const researchDirectory=new URL('../../data/research/',import.meta.url);
export const tableKeys={destinations:'slug',attractions:'external_id',hotels:'external_id',restaurants:'external_id'};
export function equalValue(actual, expected) {
  if(actual instanceof Date) actual=[actual.getFullYear(),String(actual.getMonth()+1).padStart(2,'0'),String(actual.getDate()).padStart(2,'0')].join('-');
  if(typeof expected==='number' && actual!==null) return Number(actual)===expected;
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])) : value;
  return JSON.stringify(canonical(actual??null))===JSON.stringify(canonical(expected??null));
}
export function loadResearch(city) {
  const merged=new Map();
  for(const file of readdirSync(researchDirectory).filter(f=>f.endsWith('.json')).sort()) {
    const batch=JSON.parse(readFileSync(new URL(file,researchDirectory),'utf8'));
    if(!batch.records || (city && batch.city!==city)) continue;
    for(const record of batch.records) {
      if(!tableKeys[record.table]||!record.sources?.length||!batch.checked) throw new Error('Missing research provenance: '+file);
      const id=record.table+':'+record.key;
      const item=merged.get(id)??{city:batch.city,table:record.table,key:record.key,values:{},evidence:{}};
      if(item.city!==batch.city) throw new Error('Conflicting research destination: '+id);
      const values={...record.values};
      // Reviewing metadata must not make an older room quote look newly checked.
      if(record.table!=='destinations' && !(Object.keys(values).length===1 && 'provenance_review' in values)) Object.assign(values,{source_url:record.sources[0],source_date:batch.checked});
      for(const [field,value] of Object.entries(values)) {
        if(!/^[a-z_]+$/.test(field)||['id','created_at','destination_id','source_row_hash','provenance_status'].includes(field)) throw new Error('Protected research field: '+field);
        item.values[field]=value;
        item.evidence[field]={sources:record.sources,checked:batch.checked,notes:record.notes??null};
      }
      merged.set(id,item);
    }
  }
  return [...merged.values()].sort((a,b)=>(a.table==='destinations'?0:1)-(b.table==='destinations'?0:1));
}
export async function applyResearch(client,city) {
  const changes=[];
  const columns=(await client.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public'")).rows;
  for(const record of loadResearch(city)) {
    const key=tableKeys[record.table];
    const existing=(await client.query(`SELECT * FROM ${record.table} WHERE ${key}=$1 FOR UPDATE`,[record.key])).rows[0];
    const values={...record.values};
    if(record.table!=='destinations') {
      const destination=(await client.query('SELECT id FROM destinations WHERE slug=$1',[record.city])).rows[0];
      if(!destination) throw new Error('Missing destination '+record.city);
      if(existing&&existing.destination_id!==destination.id) throw new Error('Refusing cross-city reassignment: '+record.key);
      if(!existing) values.destination_id=destination.id;
    }
    const fields=Object.keys(values).filter(f=>!existing||!equalValue(existing[f],values[f]));
    if(!fields.length) continue;
    for(const field of fields) if(!columns.some(c=>c.table_name===record.table&&c.column_name===field)) throw new Error('Unsupported seed field '+field);
    if(existing) await client.query(`UPDATE ${record.table} SET ${fields.map((f,i)=>f+'=$'+(i+1)).join(',')} WHERE ${key}=$${fields.length+1}`,[...fields.map(f=>values[f]),record.key]);
    else await client.query(`INSERT INTO ${record.table} (${key},${fields.join(',')}) VALUES (${[key,...fields].map((_,i)=>'$'+(i+1)).join(',')})`,[record.key,...fields.map(f=>values[f])]);
    for(const field of fields) changes.push({city:record.city,entity:record.key,table:record.table,field,old:existing?.[field]??null,value:values[field],...(record.evidence[field]??{notes:'Relational destination identity'})});
  }
  return changes;
}
export function recordResearchChanges(changes) {
  if(!changes.length)return;
  const report=new URL('../reports/researched-data-changes.json',import.meta.url);
  let prior=[];try{prior=JSON.parse(readFileSync(report,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  writeFileSync(report,JSON.stringify([...prior,...changes],null,2)+'\n');
}
async function main() {
  if(process.env.NODE_ENV === "production")throw new Error("Use the guarded npm run db:seed pipeline in production");
  const city=process.argv.slice(2).find(a=>!a.startsWith('--'));
  const dryRun=process.argv.includes('--dry-run'),pool=createPool(),client=await pool.connect();
  try {
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock($1)',[70072026]);
    const changes=await applyResearch(client,city);
    await client.query(dryRun?'ROLLBACK':'COMMIT');
    if(!dryRun)recordResearchChanges(changes);
    console.log(JSON.stringify({changedFields:changes.length,dryRun}));
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.code??e.message);process.exitCode=1;});
