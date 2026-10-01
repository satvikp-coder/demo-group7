import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {localEnvironment,localCompose,localAction} from './local-stack.js';
import {run,suiteLock} from './run.js';
const release=suiteLock(),env=localEnvironment();
const report={startedAt:new Date().toISOString(),verified:false,gates:[]};
const browserFile=new URL('../backend/reports/local-browser-success.json',import.meta.url);
const id=(await localCompose(['ps','-q','postgres'],'local-test-postgres',env)).output.trim();
const sql=async(query,db='heritage_planner')=>(await run('docker',['exec',id,'psql','-U','heritage_owner','-d',db,'-At','-v','ON_ERROR_STOP=1','-c',query],{env,name:'local-test-query',quiet:true})).output.trim();
const cleanup=async(db='heritage_planner')=>{
 if(!existsSync(browserFile))return;
 for(const uid of JSON.parse(readFileSync(browserFile,'utf8')).users??[]){
  assert.match(uid,/^[a-f0-9-]{36}$/);
  await sql(`DELETE FROM users WHERE id='${uid}' AND email LIKE 'local-success-%@example.test'`,db);
 }
};
const counts=async(db)=>(JSON.parse(await sql("SELECT json_build_object('destinations',(SELECT count(*) FROM destinations),'attractions',(SELECT count(*) FROM attractions),'hotels',(SELECT count(*) FROM hotels),'restaurants',(SELECT count(*) FROM restaurants),'routes',(SELECT count(*) FROM routes),'users',(SELECT count(*) FROM users),'trips',(SELECT count(*) FROM trips),'stops',(SELECT count(*) FROM itinerary_stops),'budgets',(SELECT count(*) FROM budgets))",db)));
const gate=async(name,task)=>{await task();report.gates.push({name,passed:true});};
try{
 await cleanup();
 await gate('built-browser-eight-cities-clean-console-and-whole-stack-restart',()=>run('python',['tests/frontend/local_success.py'],{env:{...env,FRONTEND_TEST_URL:env.CORS_ORIGIN},name:'local-browser-success'}));
 report.browser=JSON.parse(readFileSync(browserFile,'utf8'));assert.equal(report.browser.verified,true);
 const before=await counts();
 await gate('reseed-twice-with-persisted-user-and-eight-trips',async()=>{
  await localAction('seed');await localAction('seed');assert.deepEqual(await counts(),before);
 });
 await gate('catalog-and-persisted-reference-budget-integrity',async()=>{
  const result=await localCompose(['run','--rm','-e','INTEGRITY_REPORT_FILE=/tmp/local-integrity.json','maintenance','node','scripts/audit-completion-integrity.js'],'local-integrity',env);
  const integrity=JSON.parse(result.output.split(/\r?\n/).find(line=>line.startsWith('{"checkedAt"')));assert.equal(integrity.verified,true);
  writeFileSync(new URL('../backend/reports/local-integrity.json',import.meta.url),JSON.stringify(integrity,null,2));
 });
 const archive='backups/local-final-'+Date.now()+'.dump',target='local_restore_'+randomUUID().replaceAll('-','');
 await gate('local-backup-and-empty-database-restore',async()=>{
  await localAction('backup',[archive]);await localAction('restore',[archive,target]);
  assert.deepEqual(await counts(target),before);report.recoveryCounts=before;report.archive=archive;
  const restoredUrl=new URL(env.DATABASE_ADMIN_URL);restoredUrl.pathname='/'+target;
  await localCompose(['run','--rm','maintenance','npm','run','db:verify'],'local-restored-approved-catalog',{...env,DATABASE_ADMIN_URL:restoredUrl.href});
  const snapshot="SELECT json_agg(t ORDER BY t.id)::text FROM (SELECT id,trip_id,day_number,stop_order,stop_type,reference_id,arrival_time,departure_time,cost FROM itinerary_stops) t";
  assert.equal(await sql(snapshot,target),await sql(snapshot));
  assert.equal(await sql('SELECT json_agg(b ORDER BY b.id)::text FROM budgets b',target),await sql('SELECT json_agg(b ORDER BY b.id)::text FROM budgets b'));
  report.restoreTarget=target;
  await cleanup(target);
 });
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{
 await cleanup();report.finalCounts=await counts();report.fixturesRemoved=true;
 for(const uid of JSON.parse(readFileSync(browserFile,'utf8')).users??[]){assert.match(uid,/^[a-f0-9-]{36}$/);assert.equal(await sql(`SELECT count(*) FROM users WHERE id='${uid}'`),'0');}
 report.finishedAt=new Date().toISOString();writeFileSync(new URL('../backend/reports/local-final-suite.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({verified:report.verified,gates:report.gates.length,failure:report.failure}));release();
}
