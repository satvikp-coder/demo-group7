import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {localArgs,localEnvironment} from './local-stack.js';
const env=localEnvironment();
const container=execFileSync('docker',[...localArgs,'ps','-q','postgres'],{env,encoding:'utf8',windowsHide:true}).trim();
const tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets'];
function rows(database,table){
 const sql=`SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'hash',md5((to_jsonb(t)-ARRAY['hotel_category','weights','travelers','rooms'])::text)) ORDER BY id),'[]'::jsonb) FROM ${table} t`;
 return JSON.parse(execFileSync('docker',['exec',container,'psql','-U','heritage_owner','-d',database,'-At','-c',sql],{env,encoding:'utf8',windowsHide:true}));
}
const report={verified:false,checkedAt:new Date().toISOString(),baseline:'local_restore_itinerary_20261009',tables:[]};
for(const table of tables){
 const before=rows(report.baseline,table),after=rows('heritage_planner',table);
 const preserved=before.every(row=>after.some(current=>current.id===row.id&&current.hash===row.hash));
 report.tables.push({table,before:before.length,after:after.length,originalRowsPreserved:preserved});
 assert.ok(preserved,'Original data changed: '+table);
}
report.verified=true;
writeFileSync('reports/itinerary-live-preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
