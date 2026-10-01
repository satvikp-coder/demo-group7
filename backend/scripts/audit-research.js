import {loadResearch,tableKeys,equalValue} from './seed-research.js';
import {loadResearchRoutes,resolveResearchRoute} from './seed-research-routes.js';
import {numericEntryFee} from './csvSource.js';
export async function auditResearchCatalog(client,sources,{allowDirectionalPending=false}={}) {
 const expected={destinations:new Map(),attractions:new Map(),hotels:new Map(),restaurants:new Map()};
 for(const [file,data]of Object.entries(sources.datasets))for(const row of data.accepted){
  expected.destinations.set(row.destination_id,{slug:row.destination_id});
  const table=file.replace('.csv','');if(table==='routes')continue;
  const key=row.attraction_id??row.hotel_id??row.restaurant_id;
  const fields={name:row.hotel_name??row.name,lat:Number(row.latitude),lng:Number(row.longitude),rating:row.rating===''?null:Number(row.rating),source:row.source,source_row_hash:row.source_row_hash,provenance_status:'project_approved'};
  if(table==='attractions')Object.assign(fields,{category:row.category,entry_fee:row.entry_fee,entry_fee_numeric:numericEntryFee(row.entry_fee),duration_hours:Number(row.average_visit_duration_hours),opening_time:row.opening_time,closing_time:row.closing_time});
  if(table==='hotels')Object.assign(fields,{price_per_night:Number(row.price_per_night),stay_type:row.stay_type});
  if(table==='restaurants')fields.avg_cost_per_person=Number(row.avg_cost_per_person);
  expected[table].set(key,{city:row.destination_id,values:fields});
 }
 for(const r of loadResearch()) {
  if(r.table==='destinations')expected.destinations.set(r.key,{values:r.values});
  else expected[r.table].set(r.key,{city:r.city,values:{...expected[r.table].get(r.key)?.values,...r.values}});
 }
 let checkedFields=0;
 for(const [table,records]of Object.entries(expected)) {
  const actual=(await client.query(`SELECT * FROM ${table}`)).rows;
  if(actual.length<records.size)throw new Error('Research catalog missing approved records: '+table);
  for(const [key,record]of records) {
   const row=actual.find(r=>r[tableKeys[table]]===key);
   if(!row)throw new Error('Missing researched/approved record '+key);
   if(record.city){const d=(await client.query('SELECT slug FROM destinations WHERE id=$1',[row.destination_id])).rows[0];if(d?.slug!==record.city)throw new Error('Wrong destination '+key);}
   for(const [field,value]of Object.entries(record.values??{})){
    if(allowDirectionalPending && field==='provenance_review' && row[field]===null)continue;
    let expectedValue=value;
    if(field.endsWith('_time')&&typeof value==='string'&&/^\d\d:\d\d$/.test(value))expectedValue=value+':00';
    if(!equalValue(row[field],expectedValue))throw new Error('Research field mismatch '+key+'.'+field);
    checkedFields++;
   }
  }
 }
 const routes=loadResearchRoutes();
 const actualRoutes=(await client.query('SELECT * FROM routes')).rows;
 if(sources.datasets['routes.csv'].accepted.length)throw new Error('Review mixed legacy/researched route verification before accepting additional CSV routes');
 if(actualRoutes.length<routes.length)throw new Error('Research routes missing');
 for(const route of routes) {
  const {destination,nodes:[a,b]}=await resolveResearchRoute(client,route);
  const row=actualRoutes.find(r=>r.source_node_id===a.id&&r.destination_node_id===b.id&&r.transport_mode==='road');
  if(!row||row.destination_id!==destination.id)throw new Error('Missing researched route');
  for(const [field,value]of Object.entries(route.values))if(!(allowDirectionalPending && field.startsWith('reverse_') && row[field]===null) && !equalValue(row[field],value))throw new Error('Research route mismatch: '+route.from.external_id+'/'+route.to.external_id+'.'+field);
 }
 return {expectedCounts:{...Object.fromEntries(Object.entries(expected).map(([t,r])=>[t,r.size])),routes:routes.length},checkedFields,checkedRoutes:routes.length,basis:'Pinned approved CSV rows overlaid with field-level researched supplements; archived road routes; exact identity, relationship and value checks'};
}
