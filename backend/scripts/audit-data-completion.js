import { readFileSync, writeFileSync } from 'node:fs';
import { pool } from '../config/database.js';
import {loadResearch} from './seed-research.js';
const intended = ['ahmedabad','somnath','dwarka','modhera','champaner','gir-national-park','rann-of-kutch','saputara'];
const tables = ['destinations','attractions','hotels','restaurants','routes'];
try {
  const snapshot = {};
  for (const table of tables) snapshot[table] = (await pool.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
  const columns = (await pool.query("SELECT table_name,column_name,is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1)",[tables])).rows;
  const research=loadResearch();
  function disposition(table,row,field) {
    const entity=row.external_id??row.slug;
    const evidence=research.find(r=>r.table===table&&r.key===entity);
    const sources=[...new Set(Object.values(evidence?.evidence??{}).flatMap(e=>e.sources))];
    if(field==='source_row_hash')return {status:'not_applicable',reason:'Legacy CSV integrity hash; new researched records are verified field by field against the supplemental manifest. No legacy hash fabricated.',sources:[]};
    if(['r101','r201'].includes(entity))return {status:'unknown_after_research',reason:'Legacy Toran Dining Hall identity/location not independently verified. Retained approved row; excluded from new routing. Attached hotel restaurant does not establish this exact legacy business identity.',sources};
    if(field==='wheelchair_accessible')return {status:'unknown_after_research',reason:'No reliable whole-attraction yes/no accessibility verification selected. Partial visitor guidance, facilities, tours or user reviews do not certify the full attraction. Existing best_time_note records supported partial information.',sources};
    if(['physical_demand','value_score','tier','tag'].includes(field))return {status:'unrated',reason:'Editorial classification or computed score has no approved rubric. Do not invent a score/tier from price, photos or assumptions.',sources};
    if(field==='entry_fee_numeric')return {status:'unknown_after_research',reason:entity==='a502'?'Kevada sources conflict between free, shared-pass and separate paid entry; no current authoritative standalone/general Indian tariff verified.':entity==='a803'?'Saputara Museum current closure reported by business listing; official 2023 directory omits general Indian adult price. Secondary prices conflict (2/5/10 INR).': 'No single destination-wide admission charge exists; attraction-specific prices are stored separately.',sources};
    if(['opening_time','closing_time'].includes(field))return {status:'unknown_after_research',reason:entity==='a402'?'Modheshwari published hours conflict, including 07:00-19:30 versus 06:00-20:00 on the same YatraDham page. Official tourism page does not resolve the discrepancy.':entity==='a803'?'Museum currently reported temporarily closed; historical 2023 hours are documented in notes, not represented as current availability.':['a501','a502'].includes(entity)?'Official park guidance uses sunrise/sunset; fixed clock times cannot express date-dependent daylight opening.':'No authoritative fixed gate hours verified for this outdoor lake/viewpoint/salt-desert site. Daylight advice is not a fixed opening interval.',sources};
    if(table==='destinations'&&['rating','entry_fee','duration','avg_visit_time','nearest_hospital','nearest_police_station'].includes(field))return {status:'not_applicable_without_defined_basis',reason:'City/landscape is not a single ticketed attraction or point. No approved aggregate rating/duration or fixed anchor for nearest services exists.',sources};
    return {status:'optional_unfilled',reason:'Nullable display/editorial metadata; not needed for the existing itinerary generator. No verified field value selected. This is an explicit remaining field, not a claim that it is unavailable publicly.',sources};
  }
  const cities = [...new Set([...intended,...snapshot.destinations.map(d=>d.slug)])].map(slug=>{
    const destination=snapshot.destinations.find(d=>d.slug===slug);
    const records=Object.fromEntries(tables.map(t=>[t,snapshot[t].filter(r=>t==='destinations'?r.id===destination?.id:r.destination_id===destination?.id)]));
    const gaps=[];
    for(const [table,rows] of Object.entries(records)) {
      if(!rows.length) gaps.push({table,entity:slug,field:'record',status:'research_pending'});
      for(const row of rows) for(const [field,value] of Object.entries(row)) {
        if(table==='routes' && /^(source|destination)_(attraction|hotel|restaurant)_id$/.test(field)) continue; // Exactly one endpoint type is required; other FKs must be NULL.
        if(value===null || value==='') gaps.push({table,entity:row.external_id??row.slug??row.id,name:row.name,field,...disposition(table,row,field),nullable:columns.find(c=>c.table_name===table&&c.column_name===field)?.is_nullable==='YES'});
      }
    }
    const nodes=[...records.attractions,...records.hotels,...records.restaurants];
    const missingPairs=[];
    for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++) {
      if(records.hotels.includes(nodes[i])&&records.hotels.includes(nodes[j])) continue;
      if(!records.routes.some(r=>[r.source_node_id,r.destination_node_id].includes(nodes[i].id)&&[r.source_node_id,r.destination_node_id].includes(nodes[j].id))) missingPairs.push([nodes[i].external_id,nodes[j].external_id]);
    }
    return {slug,classification:'PARTIALLY COMPLETE',counts:Object.fromEntries(tables.map(t=>[t,records[t].length])),gaps,missingRoutePairs:missingPairs};
  });
  const report={checkedAt:new Date().toISOString(),counts:Object.fromEntries(tables.map(t=>[t,snapshot[t].length])),schemaLimits:['No destination coordinate columns','No route fare column','No hotel amenities or accessibility columns','No restaurant English description column','No calendar exceptions or split opening intervals','value_score has no documented authoritative calculation; nullable'],cities};
  writeFileSync(new URL('../reports/data-completion-checklist.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({counts:report.counts,cities:cities.map(c=>({slug:c.slug,missingFields:c.gaps.length,missingRoutePairs:c.missingRoutePairs.length}))},null,2));
} finally { await pool.end(); }
