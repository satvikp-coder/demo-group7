import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createPool} from './database.js';
const pool=createPool(),report={checkedAt:new Date().toISOString(),checks:{},verified:false};
try {
 const resources={};
 for(const table of ['destinations','attractions','hotels','restaurants','routes'])resources[table]=(await pool.query(`SELECT * FROM ${table}`)).rows;
 const cities=new Set(resources.destinations.map(r=>r.id));
 const nodes=new Map(['attractions','hotels','restaurants'].flatMap(t=>resources[t].map(r=>[r.id,r])));
 for(const table of ['attractions','hotels','restaurants']) {
  assert.ok(resources[table].every(r=>cities.has(r.destination_id)));
  assert.ok(resources[table].every(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lng))&&Math.abs(Number(r.lat))<=90&&Math.abs(Number(r.lng))<=180));
  const key=new Set();for(const r of resources[table]){const k=r.destination_id+':'+r.name.toLowerCase();assert.ok(!key.has(k),'Duplicate '+table);key.add(k);}
 }
 report.checks.childrenAndCoordinates=true;
 const pairs=new Set(),cross=[];
 for(const r of resources.routes) {
  assert.ok(Number(r.distance_km)>0&&r.travel_time_minutes>0&&r.source_url&&r.source_date&&r.source_row_hash);
  const a=nodes.get(r.source_node_id),b=nodes.get(r.destination_node_id);
  assert.ok(a&&b&&a.id!==b.id&&a.destination_id===r.destination_id&&b.destination_id===r.destination_id);
  const key=[a.id,b.id].sort().join(':')+':'+r.transport_mode;
  assert.ok(!pairs.has(key),'Duplicate/reversed parallel route');pairs.add(key);
  assert.equal(r.transport_mode,'road');
 }
 report.checks.routes={count:resources.routes.length,validEndpoints:true,noDuplicateUndirectedPairs:true,positiveDistancesAndTimes:true,provenancePresent:true,
  reverseEvidence:resources.routes.filter(r=>r.reverse_distance_km!==null).length,
  asymmetric:resources.routes.filter(r=>r.reverse_distance_km!==null&&(Number(r.reverse_distance_km)!==Number(r.distance_km)||r.reverse_travel_time_minutes!==r.travel_time_minutes)).length,
  directionalLimitation:'Independent reverse evidence is used when available; missing reverse evidence remains an explicit model limitation'};
 for(const [table,field] of [['attractions','entry_fee_numeric'],['hotels','price_per_night'],['restaurants','avg_cost_per_person']]) assert.ok(resources[table].every(r=>r[field]===null||Number(r[field])>=0));
 report.checks.nonnegativeKnownPrices=true;
 const orphanStops=(await pool.query('SELECT count(*) FROM itinerary_stops s LEFT JOIN trips t ON t.id=s.trip_id WHERE t.id IS NULL')).rows[0].count;
 const orphanBudgets=(await pool.query('SELECT count(*) FROM budgets b LEFT JOIN trips t ON t.id=b.trip_id WHERE t.id IS NULL')).rows[0].count;
 assert.equal(Number(orphanStops),0);assert.equal(Number(orphanBudgets),0);
 report.checks.noOrphanTripsOrBudgets=true;
 const stops=(await pool.query('SELECT s.*,t.destination_id FROM itinerary_stops s JOIN trips t ON t.id=s.trip_id')).rows;
 for(const s of stops) {
  if (['hotel','attraction','meal'].includes(s.stop_type)) {
   const n=nodes.get(s.reference_id);assert.ok(n&&n.destination_id===s.destination_id,'Invalid itinerary reference');
  }
  assert.ok(Number(s.cost)>=0&&s.arrival_time<=s.departure_time,'Invalid persisted time/cost');
 }
 const budgets=(await pool.query(`SELECT b.*,t.budget,COALESCE(SUM(s.cost) FILTER(WHERE s.stop_type='hotel'),0) AS hotel,
  COALESCE(SUM(s.cost) FILTER(WHERE s.stop_type='attraction'),0) AS attractions,
  COALESCE(SUM(s.cost) FILTER(WHERE s.stop_type='meal'),0) AS meals,
  COALESCE(SUM(s.cost) FILTER(WHERE s.stop_type='transit'),0) AS transit,COALESCE(SUM(s.cost),0) AS total
  FROM budgets b JOIN trips t ON t.id=b.trip_id LEFT JOIN itinerary_stops s ON s.trip_id=t.id
  GROUP BY b.id,t.id`)).rows;
 for(const b of budgets) {
  for(const [stored,sum] of [['spent_hotel','hotel'],['spent_attractions','attractions'],['spent_meals','meals'],['spent_transit','transit']])assert.equal(Number(b[stored]),Number(b[sum]));
  assert.equal(Number(b.remaining),Number(b.budget)-Number(b.total));
 }
 report.checks.persistedReferencesAndBudgetSums={stopsChecked:stops.length,budgetsChecked:budgets.length,verified:true};
 report.counts=Object.fromEntries(Object.entries(resources).map(([t,r])=>[t,r.length]));report.verified=true;
}catch(e){report.error=e.message;process.exitCode=1;}finally{await pool.end();writeFileSync(process.env.INTEGRITY_REPORT_FILE??new URL('../reports/completion-integrity.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
