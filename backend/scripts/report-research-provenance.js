import {readFileSync,writeFileSync} from 'node:fs';
import {loadResearch,equalValue} from './seed-research.js';
import {loadResearchRoutes} from './seed-research-routes.js';
const before=JSON.parse(readFileSync(new URL('../../data/research/before-coverage.json',import.meta.url),'utf8'));
const after=JSON.parse(readFileSync(new URL('../reports/final-data-coverage.json',import.meta.url),'utf8'));
function records(snapshot,table){return snapshot.cities.flatMap(c=>table==='destinations'?[c.destination]:c.resources[table].rows);}
const fields=[];
for(const record of loadResearch()) {
 const old=records(before,record.table).find(r=>(r.external_id??r.slug)===record.key);
 const current=records(after,record.table).find(r=>(r.external_id??r.slug)===record.key);
 for(const [field,value]of Object.entries(record.values))fields.push({city:record.city,table:record.table,entity:record.key,name:current.name,field,value,previous:old?.[field]??null,change:!old?'new_record':equalValue(old[field],value)?'verified_unchanged':old[field]==null?'filled':'corrected',...record.evidence[field]});
}
const routes=loadResearchRoutes().map(r=>({city:r.city,from:r.from.external_id,to:r.to.external_id,...r.values}));
const tables=['destinations','attractions','hotels','restaurants','routes'];
const changed=fields.filter(f=>f.change!=='verified_unchanged'&&!['source_url','source_date','source','slug'].includes(f.field));
const report={checkedAt:new Date().toISOString(),counts:Object.fromEntries(tables.map(t=>[t,{before:before.counts[t],after:after.counts[t],added:after.counts[t]-before.counts[t]}])),fieldCounts:{basis:'Unique merged entity/field differences from pre-research snapshot; excludes source labels/dates and derived slugs. Includes fields on new records.',accessibility:changed.filter(f=>f.field==='wheelchair_accessible').length,pricing:changed.filter(f=>['entry_fee','entry_fee_numeric','price_per_night','avg_cost_per_person'].includes(f.field)).length,coordinates:changed.filter(f=>['lat','lng'].includes(f.field)).length,metadata:changed.filter(f=>!['lat','lng','wheelchair_accessible','entry_fee','entry_fee_numeric','price_per_night','avg_cost_per_person'].includes(f.field)).length},fields,routes};
writeFileSync(new URL('../reports/data-provenance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const escape=v=>JSON.stringify(v??null).replaceAll('|','\\|').replaceAll('\n',' ');
const lines=['# Researched data provenance','','Generated from merged seed supplements and the original database snapshot. Full typed values, old values, evidence and route sources are in `data-provenance.json`. Archived source pages/maps/routes are in `data/research/`.','', '| City | Entity | Field | Value | Previous | Change | Sources | Checked | Notes |','|---|---|---|---|---|---|---|---|---|'];
for(const f of fields)lines.push('| '+[f.city,f.entity,f.field,escape(f.value),escape(f.previous),f.change,f.sources.join(' ; '),f.checked,f.notes??''].map(x=>String(x).replaceAll('\n',' ')).join(' | ')+' |');
lines.push('','## Road routing evidence','','Distances are sourced road-network estimates; durations are estimates, not live traffic. No transport fare is inferred. Endpoints use preserved entity IDs via external IDs. OSRM large snaps were rejected and reviewed Google directions used where documented. The current planner symmetrizes stored edges.','', '| City | From | To | km | minutes | Checked | Source | Notes |','|---|---|---|---|---|---|---|---|');
for(const r of routes)lines.push('| '+[r.city,r.from,r.to,r.distance_km,r.travel_time_minutes,r.source_date,r.source_url,r.source].join(' | ')+' |');
writeFileSync(new URL('../reports/data-provenance.md',import.meta.url),lines.join('\n')+'\n');console.log(JSON.stringify({counts:report.counts,fieldCounts:report.fieldCounts,documentedFields:fields.length,routes:routes.length}));
