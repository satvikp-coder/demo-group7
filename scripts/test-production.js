import {randomBytes,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import pg from '../backend/node_modules/pg/lib/index.js';
import {npm,run,waitFor,reportDir,suiteLock} from './run.js';
import {databaseArchive} from '../backend/scripts/backup.js';
const releaseLock=suiteLock();
const project='heritage-prod-'+randomUUID().slice(0,8);
const password=randomBytes(24).toString('hex');
const httpPort=process.env.PRODUCTION_TEST_PORT??'8088', dbPort=process.env.PG_TEST_PORT??'55433';
const origin='http://localhost:'+httpPort;
const env={...process.env,POSTGRES_PASSWORD:password,POSTGRES_APP_PASSWORD:password,DATABASE_URL:`postgresql://heritage_app:${password}@postgres:5432/heritage_planner`,DATABASE_ADMIN_URL:`postgresql://heritage_owner:${password}@postgres:5432/heritage_planner`,JWT_SECRET:randomBytes(48).toString('hex'),CORS_ORIGIN:origin,HTTP_PORT:httpPort,PG_TEST_PORT:dbPort};
const hostEnv={...env,DATABASE_URL:`postgresql://heritage_owner:${password}@localhost:${dbPort}/heritage_planner`,FRONTEND_TEST_URL:origin,API_TEST_URL:origin+'/api',PRODUCTION_BROWSER_TEST:'true',NODE_ENV:'production',PORT:'5000'};
const args=['compose','-p',project,'-f','compose.yml','-f','compose.staging.yml'];
const compose=(more,name,options={})=>run('docker',[...args,...more],{env,name,...options});
const report={startedAt:new Date().toISOString(),project,verified:false,gates:[]};
let pool;
const gate=async(name,task)=>{await task();report.gates.push({name,passed:true});writeFileSync(new URL('container-suite.json',reportDir),JSON.stringify(report,null,2));};
try {
 await gate('container-build',()=>compose(['build'],'container-build'));
 await compose(['up','-d','postgres'],'postgres-start');
 const pgId=(await compose(['ps','-q','postgres'],'postgres-id',{quiet:true})).output.trim();
 const until=Date.now()+60000;
 while(true){const probe=await run('docker',['exec',pgId,'pg_isready','-U','heritage_owner','-d','heritage_planner'],{env,name:'postgres-ready',quiet:true,allowFailure:true});if(probe.code===0)break;if(Date.now()>until)throw new Error('Postgres readiness timeout');await new Promise(r=>setTimeout(r,1000));}
 await gate('fresh-local-bootstrap-migrations-and-approved-seed',()=>compose(['run','--rm','maintenance','node','scripts/bootstrap-local.js'],'container-migrate'));
 await gate('container-seed',()=>compose(['run','--rm','maintenance','npm','run','db:seed'],'container-seed'));
 await gate('container-reseed',()=>compose(['run','--rm','maintenance','npm','run','db:seed'],'container-reseed'));
 await gate('container-data-verify',()=>compose(['run','--rm','maintenance','npm','run','db:verify'],'container-data-verify'));
 await compose(['up','-d','backend','frontend'],'application-start');await waitFor(origin+'/ready');
 pool=new pg.Pool({connectionString:hostEnv.DATABASE_URL});
 pool.on('error',()=>{report.maintenanceConnectionInterrupted=true;});
 await gate('runtime-privileges-security-headers-and-log-redaction',async()=>{
  const assert=(await import('node:assert/strict')).default;
  const role=(await pool.query("SELECT rolsuper,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname='heritage_app'")).rows[0];
  assert.deepEqual(role,{rolsuper:false,rolcreatedb:false,rolcreaterole:false});
  for(const table of ['schema_migrations','seed_managed_rows'])assert.equal((await pool.query('SELECT has_table_privilege($1,$2,$3) allowed',['heritage_app',table,'SELECT'])).rows[0].allowed,false);
  assert.equal((await pool.query("SELECT has_schema_privilege('heritage_app','public','CREATE') allowed")).rows[0].allowed,false);
  const response=await fetch(origin+'/health-static?token=edge-redaction-probe');assert.equal(response.status,200);
  assert.equal(response.headers.get('x-frame-options'),'DENY');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.ok(response.headers.get('content-security-policy').includes("script-src 'self'"));
  const frontendId=(await compose(['ps','-q','frontend'],'frontend-id',{quiet:true})).output.trim();
  const details=JSON.parse((await run('docker',['inspect','--format','{{json .}}',frontendId],{env,name:'frontend-inspection',quiet:true})).output);
  assert.notEqual(details.Config.User,'root');assert.notEqual(details.Config.User,'0');
  assert.deepEqual(details.HostConfig.LogConfig,{Type:'local',Config:{'max-file':'5','max-size':'10m'}});
  const logs=await compose(['logs','--no-color','frontend'],'frontend-logs',{quiet:true});assert.ok(logs.output.includes('edge_request'));assert.ok(!logs.output.includes('edge-redaction-probe'));
  report.runtimeRole=role;report.rotatedLogs=true;report.edgeLogsRedacted=true;
 });
 await gate('https-edge-configuration',()=>run('docker',['run','--rm','-e','PUBLIC_HOSTNAME=heritage.example.invalid','--mount','type=bind,source='+fileURLToPath(new URL('../deploy/Caddyfile',import.meta.url))+',target=/etc/caddy/Caddyfile,readonly','caddy:2-alpine','caddy','validate','--config','/etc/caddy/Caddyfile','--adapter','caddyfile'],{env,name:'tls-configuration'}));
 const backendId=(await compose(['ps','-q','backend'],'backend-id',{quiet:true})).output.trim();
 report.memoryBefore=(await run('docker',['stats','--no-stream','--format','{{.MemUsage}}',backendId],{env,name:'memory-before',quiet:true})).output.trim();
 await gate('production-api-security-load-and-concurrency',()=>run(process.execPath,['--import','./backend/node_modules/tsx/dist/loader.mjs','scripts/production-smoke.js'],{env:hostEnv,name:'production-api-smoke'}));
 report.memoryAfter=(await run('docker',['stats','--no-stream','--format','{{.MemUsage}}',backendId],{env,name:'memory-after',quiet:true})).output.trim();
 await compose(['restart','backend'],'restart-after-deliberate-rate-limit');await waitFor(origin+'/ready');
 await gate('built-spa-browser-all-cities-admin',()=>npm(['--prefix','backend','run','test:frontend'],{env:hostEnv,name:'browser-production'}));
 await gate('built-spa-platform',()=>run('python',['tests/frontend/completion_platform.py'],{env:hostEnv,name:'browser-platform'}));
 // Keep a real generated trip through backup/restore; remove only the test user afterward.
 const user=await (await fetch(origin+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Recovery drill',email:'recovery-'+project+'@example.test',password:'Aa1!'+password,role:'tourist'})})).json();
 const login=await (await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.user.email,password:'Aa1!'+password})})).json();
 const headers={'Content-Type':'application/json',Authorization:'Bearer '+login.token};
 const city=await (await fetch(origin+'/api/destinations/modhera')).json();const hotels=await(await fetch(origin+'/api/destinations/'+city.id+'/hotels')).json();
 const trip=await(await fetch(origin+'/api/trips',{method:'POST',headers,body:JSON.stringify({destination_id:city.id,days:2,budget:20000,starting_hotel_id:hotels[0].id,start_time:'08:00'})})).json();
 const generated=await(await fetch(origin+'/api/trips/'+trip.trip.id+'/generate-itinerary',{method:'POST',headers,body:'{}'})).json();
 await gate('whole-stack-restart-persistence-and-new-login',async()=>{
  const assert=(await import('node:assert/strict')).default;
  await compose(['restart','postgres','backend','frontend'],'whole-stack-restart');await waitFor(origin+'/ready');
  const response=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.user.email,password:'Aa1!'+password})});
  assert.equal(response.status,200);headers.Authorization='Bearer '+(await response.json()).token;
  assert.deepEqual(await(await fetch(origin+'/api/trips/'+trip.trip.id,{headers})).json(),generated);
  assert.deepEqual(await(await fetch(origin+'/api/trips/'+trip.trip.id+'/budget',{headers})).json(),generated.budget);
  report.restartPersistence=true;
 });
 mkdirSync('backups',{recursive:true});const file='backups/'+project+'.dump';
 await gate('backup-restorable-archive',()=>databaseArchive('backup',file,{...hostEnv,PG_TOOLS_CONTAINER:pgId}));
 const restored='recovery_'+randomUUID().replaceAll('-','');await pool.query(`CREATE DATABASE ${restored}`);
 const restoredUrl=new URL(hostEnv.DATABASE_URL);restoredUrl.pathname='/'+restored;
 await gate('restore-clean-database',()=>databaseArchive('restore',file,{...hostEnv,DATABASE_URL:restoredUrl.href,PG_TOOLS_CONTAINER:pgId}));
 // Reapply runtime grants omitted by --no-acl; migration ledger prevents DDL replay.
 const restoredInternal=new URL(env.DATABASE_URL);restoredInternal.pathname='/'+restored;
 const restoredAdmin=new URL(env.DATABASE_ADMIN_URL);restoredAdmin.pathname='/'+restored;
 await run('docker',[...args,'run','--rm','maintenance','npm','run','db:migrate'],{env:{...env,DATABASE_ADMIN_URL:restoredAdmin.href},name:'restored-runtime-grants'});
 await compose(['stop','backend'],'stop-before-recovery');
 await run('docker',[...args,'up','-d','--force-recreate','backend'],{env:{...env,DATABASE_URL:restoredInternal.href},name:'restored-backend-start'});await waitFor(origin+'/ready');
 await gate('restored-persisted-trip-budget',async()=>{
  const assert=(await import('node:assert/strict')).default;
  const recovered=await(await fetch(origin+'/api/trips/'+trip.trip.id,{headers})).json();assert.deepEqual(recovered,generated);
  const budget=await(await fetch(origin+'/api/trips/'+trip.trip.id+'/budget',{headers})).json();assert.deepEqual(budget,generated.budget);
  const restoredPool=new pg.Pool({connectionString:restoredUrl.href});
  try{report.recoveryCounts={};for(const t of ['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets'])report.recoveryCounts[t]=(await restoredPool.query(`SELECT count(*)::int n FROM ${t}`)).rows[0].n;}
  finally{await restoredPool.end();}
  report.recoveredTripDays=recovered.days.length;report.recoveredBudget=budget.total;report.archiveBytes=readFileSync(file).length;
 });
 await gate('database-outage-and-recovery',async()=>{
  const assert=(await import('node:assert/strict')).default;
  await compose(['stop','postgres'],'database-outage');
  assert.equal((await fetch(origin+'/health')).status,200);
  assert.equal((await fetch(origin+'/ready')).status,503);
  const failed=await fetch(origin+'/api/destinations');assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{error:{message:'Service temporarily unavailable'}});
  await compose(['start','postgres'],'database-restoration');await waitFor(origin+'/ready');
  assert.equal((await fetch(origin+'/api/trips/'+trip.trip.id,{headers})).status,200);
 });
 await gate('graceful-stop-and-restart',async()=>{
  await compose(['stop','backend'],'graceful-stop');
  const logs=await compose(['logs','--no-color','backend'],'backend-logs',{quiet:true});
  if(!logs.output.includes('server_shutdown_complete'))throw new Error('Graceful shutdown event absent');
  await compose(['start','backend'],'backend-restart');await waitFor(origin+'/ready');
 });
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{
 try{await pool?.end();}catch{report.maintenancePoolCloseFailed=true;}
 // Containers and their isolated data volume remain for evidence, but are stopped.
 try{await compose(['stop'],'staging-stop');report.stagingStopped=true;}catch{}
 report.finishedAt=new Date().toISOString();writeFileSync(new URL('container-suite.json',reportDir),JSON.stringify(report,null,2));console.log(JSON.stringify(report));releaseLock();
}
