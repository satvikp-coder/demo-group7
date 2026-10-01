import {writeFileSync} from 'node:fs';
import {createPool} from '../backend/scripts/database.js';
import {loadResearch} from '../backend/scripts/seed-research.js';
import {loadResearchRoutes} from '../backend/scripts/seed-research-routes.js';
const pool=createPool(),report={checkedAt:new Date().toISOString(),verified:false,counts:{},duplicateEntities:[],invalidCoordinates:[],images:[]};
try {
 for(const table of ['destinations','attractions','hotels','restaurants','routes'])report.counts[table]=(await pool.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n;
 for(const table of ['attractions','hotels','restaurants']){
  report.duplicateEntities.push(...(await pool.query(`SELECT destination_id,lower(name) AS name,count(*)::int n FROM ${table} GROUP BY destination_id,lower(name) HAVING count(*)>1`)).rows.map(row=>({table,...row})));
  report.invalidCoordinates.push(...(await pool.query(`SELECT id FROM ${table} WHERE lat NOT BETWEEN -90 AND 90 OR lng NOT BETWEEN -180 AND 180 OR lat IS NULL OR lng IS NULL`)).rows.map(row=>({table,...row})));
 }
 const urls=new Set(loadResearch().map(r=>r.values.image_url).filter(u=>typeof u==='string'&&u.startsWith('https://')));
 const pending=[...urls];let next=0;
 await Promise.all(Array.from({length:3},async()=>{while(next<pending.length){const url=pending[next++];let outcome;try{const response=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});outcome={status:response.status,contentType:response.headers.get('content-type'),available:response.ok};}catch{outcome={available:false,failure:'unreachable-or-timeout'};}
 report.images.push({url,...outcome,rights:'External source retains rights; redistribution license not established; existing category fallback preserved'});}}));
 const routes=loadResearchRoutes();report.routing={rows:routes.length,reverseEvidence:routes.filter(r=>r.values.reverse_distance_km!==null).length,asymmetric:routes.filter(r=>r.values.reverse_distance_km!==null&&(r.values.reverse_distance_km!==r.values.distance_km||r.values.reverse_travel_time_minutes!==r.values.travel_time_minutes)).length};
 report.verified=!report.duplicateEntities.length&&!report.invalidCoordinates.length;
 report.imagePolicy='HEAD only; no copyrighted images downloaded. Availability is time-sensitive; failures use existing safe assets. Unknown rights are not represented as licensed.';
}finally{await pool.end();writeFileSync(new URL('../backend/reports/production-data-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({verified:report.verified,counts:report.counts,images:report.images.length,unavailableImages:report.images.filter(i=>!i.available).length,routing:report.routing}));}
