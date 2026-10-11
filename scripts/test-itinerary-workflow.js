// Targeted real-stack regressions on a separately created/seeded disposable DB.
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {createPool} from '../backend/scripts/database.js';
import {migrate} from '../backend/scripts/migrate.js';
import {seedDatabase} from '../backend/scripts/seed.js';
import {applyExpansion} from '../backend/scripts/expand-catalog.js';
import {applyEnrichment} from '../backend/scripts/enrich-catalog.js';
import {loadSources} from '../backend/scripts/csvSource.js';
import {npm,run,waitFor,suiteLock} from './run.js';
const release=suiteLock(),admin=createPool(),database='heritage_audit_'+randomUUID().replaceAll('-','');
const phase=process.argv[2] || 'auth';
let backend,frontend,isolated,created=false;
const report={phase,startedAt:new Date().toISOString(),verified:false,isolatedDatabase:database};
try {
 await admin.query(`CREATE DATABASE ${database}`);created=true;
 const url=new URL(process.env.DATABASE_URL);url.pathname='/'+database;
 const env={...process.env,DATABASE_URL:url.href,NODE_ENV:'test',JWT_SECRET:randomBytes(48).toString('hex'),CORS_ORIGIN:'http://localhost:4310',PORT:'5310',AUTH_RATE_LIMIT:'500'};
 isolated=createPoolWith(env);
 await migrate(isolated);await seedDatabase(isolated,await loadSources());
 if(['expanded','demo'].includes(phase)){
  const tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets'];
  const snapshot=async()=>Object.fromEntries(await Promise.all(tables.map(async table=>[table,(await isolated.query(`SELECT * FROM ${table} ORDER BY id`)).rows])));
  const before=await snapshot(),dry=await applyExpansion(isolated,{dryRun:true});if(JSON.stringify(before)!==JSON.stringify(await snapshot()))throw new Error('Dry-run changed database');
  const imported=await applyExpansion(isolated),after=await snapshot(),again=await applyExpansion(isolated);
  if(again.inserted.length||again.routesInserted||JSON.stringify(after)!==JSON.stringify(await snapshot()))throw new Error('Expansion not idempotent');
  for(const table of tables)for(const row of before[table])if(JSON.stringify(row)!==JSON.stringify(after[table].find(r=>r.id===row.id)))throw new Error('Original record changed');
  report.expansion={before:Object.fromEntries(tables.map(t=>[t,before[t].length])),after:Object.fromEntries(tables.map(t=>[t,after[t].length])),imported,idempotent:true,originalRowsPreserved:true,dryRunRolledBack:true};
 }

 if(phase==='demo'){
  report.phase2Expansion=await applyExpansion(isolated,{phase2:true});
  report.phase3Enrichment=await applyEnrichment(isolated);
  report.hotelCoverage=await applyExpansion(isolated,{hotelCoverage:true});
 }
 backend=spawn(process.execPath,['--import','tsx','server.js'],{cwd:new URL('../backend/',import.meta.url),env,windowsHide:true,stdio:'ignore'});await waitFor('http://localhost:5310/ready');
 if(['expanded','demo'].includes(phase))await run(process.execPath,['backend/scripts/test-itinerary-api.js'],{env:{...env,API_TEST_URL:'http://localhost:5310/api'},name:'itinerary-api-matrix'});
 if(phase==='demo')await run(process.execPath,['frontend/node_modules/vite/bin/vite.js','build','frontend'],{env:{...env,VITE_API_BASE_URL:'/api'},name:'itinerary-demo-build'});
 const frontendArgs=phase==='demo'?['--input-type=module','--eval',"import {preview} from 'vite'; await preview({preview:{host:'127.0.0.1',port:4310,strictPort:true,proxy:{'/api':'http://localhost:5310'}}});"]:['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4310','--strictPort'];
 frontend=spawn(process.execPath,frontendArgs,{cwd:new URL('../frontend/',import.meta.url),env:{...env,VITE_API_BASE_URL:phase==='demo'?'/api':'http://localhost:5310/api'},windowsHide:true,stdio:'ignore'});await waitFor('http://localhost:4310');
 if(phase==='demo')await run('python',['tests/frontend/itinerary_auth.py'],{env:{...env,FRONTEND_TEST_URL:'http://localhost:4310',API_TEST_URL:'http://localhost:5310/api'},name:'itinerary-auth-final'});
 await run('python',['tests/frontend/itinerary_'+phase+'.py'],{env:{...env,FRONTEND_TEST_URL:'http://localhost:4310',API_TEST_URL:'http://localhost:5310/api'},name:'itinerary-'+phase});
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally {
 backend?.kill();frontend?.kill();await isolated?.end();
 if(created){await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);report.isolatedDatabaseRemoved=true;}
 await admin.end();report.finishedAt=new Date().toISOString();writeFileSync(new URL('../reports/itinerary-'+phase+'-runner.json',import.meta.url),JSON.stringify(report,null,2));release();console.log(JSON.stringify(report));
}
function createPoolWith(env){const old=process.env.DATABASE_URL;process.env.DATABASE_URL=env.DATABASE_URL;try{return createPool()}finally{process.env.DATABASE_URL=old}}
