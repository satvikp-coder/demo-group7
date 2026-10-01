import {loadResearch} from './seed-research.js';
import {loadResearchRoutes} from './seed-research-routes.js';
import {writeFileSync} from 'node:fs';
const intervals={price_per_night:7,avg_cost_per_person:30,entry_fee_numeric:30,entry_fee:30,opening_time:30,closing_time:30,rating:90,seasonal_note:30,best_time_note:30};
const today=Date.now(),fields=[];
for(const record of loadResearch())for(const [field,days]of Object.entries(intervals)){
 if(!(field in record.values))continue;
 const evidence=record.evidence[field];
 const source_date=evidence.checked;
 fields.push({city:record.city,table:record.table,key:record.key,field,valueKnown:record.values[field]!==null,source_date,refreshDays:days,sources:evidence.sources,
  due:new Date(new Date(source_date).getTime()+days*86400000).toISOString().slice(0,10),overdue:today>new Date(source_date).getTime()+days*86400000});
}
for(const route of loadResearchRoutes())fields.push({city:route.city,table:'routes',key:route.from.external_id+'>'+route.to.external_id,field:'road_network_estimate',source_date:route.values.source_date,refreshDays:90,sources:[route.values.source_url],overdue:today>new Date(route.values.source_date).getTime()+90*86400000});
const report={checkedAt:new Date().toISOString(),fields,overdueFields:fields.filter(f=>f.overdue).length,policy:'Review seasonal closures, safari slots and museum reopening before every booking; quotes are estimates, not availability guarantees.'};
writeFileSync(new URL('../reports/production-data-freshness.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({fields:fields.length,overdueFields:report.overdueFields}));
