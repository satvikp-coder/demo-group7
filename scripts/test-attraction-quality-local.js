// Only disposable fixtures; never generate provider traffic in automatic suites.
import {spawn} from "node:child_process";
import {randomUUID,randomBytes} from "node:crypto";
import {writeFileSync,openSync,closeSync} from "node:fs";
import pg from "../backend/node_modules/pg/lib/index.js";
import {localEnvironment,localArgs,localRoot,localCompose} from "./local-stack.js";
import {run,waitFor,suiteLock} from "./run.js";
import {migrate} from "../backend/scripts/migrate.js";
import {seedDatabase} from "../backend/scripts/seed.js";
import {loadSources} from "../backend/scripts/csvSource.js";
import {applyExpansion} from "../backend/scripts/expand-catalog.js";
import {applyEnrichment} from "../backend/scripts/enrich-catalog.js";
const release=suiteLock(),runtime=localEnvironment(),database="heritage_attractions_"+randomUUID().replaceAll("-","");
const url=new URL(runtime.DATABASE_ADMIN_URL);url.hostname="127.0.0.1";url.port="55434";
let admin,isolated,created=false,backend,frontend;
const serverLog=openSync(new URL("../backend/reports/production/attraction-quality-server.txt",import.meta.url),"w");
const report={startedAt:new Date().toISOString(),verified:false};
try{
 await run("docker",[...localArgs,"-f","compose.staging.yml","up","-d","postgres"],{env:{...runtime,PG_TEST_PORT:"55434"},cwd:localRoot,name:"chat-test-private-db-access"});
 await waitFor(runtime.CORS_ORIGIN+"/ready");
 admin=new pg.Pool({connectionString:url.href});await admin.query("CREATE DATABASE "+database);created=true;url.pathname="/"+database;
 isolated=new pg.Pool({connectionString:url.href});
 await migrate(isolated);await seedDatabase(isolated,await loadSources());await applyExpansion(isolated);await applyExpansion(isolated,{phase2:true});await applyEnrichment(isolated);await applyExpansion(isolated,{hotelCoverage:true});
 const original=(await isolated.query("SELECT jsonb_object_agg(table_name,rows) data FROM (SELECT 'attractions' table_name,jsonb_agg(to_jsonb(a) ORDER BY id) rows FROM attractions a UNION ALL SELECT 'hotels',jsonb_agg(to_jsonb(a) ORDER BY id) FROM hotels a UNION ALL SELECT 'restaurants',jsonb_agg(to_jsonb(a) ORDER BY id) FROM restaurants a UNION ALL SELECT 'routes',jsonb_agg(to_jsonb(a) ORDER BY id) FROM routes a) s")).rows[0].data;
 const count=()=>isolated.query('SELECT count(*)::int n FROM attractions').then(r=>r.rows[0].n);const before=await count();
 const dry=await applyExpansion(isolated,{attractionQuality:true,dryRun:true});if(await count()!==before)throw Error('Dry run changed rows');
 // Deliberate late route-coordinate failure proves that inserted rows are rolled back.
 const h=(await isolated.query('SELECT id,lat FROM hotels ORDER BY id LIMIT 1')).rows[0];await isolated.query('UPDATE hotels SET lat=lat+0.1 WHERE id=$1',[h.id]);
 let rejected=false;try{await applyExpansion(isolated,{attractionQuality:true});}catch{rejected=true;}finally{await isolated.query('UPDATE hotels SET lat=$2 WHERE id=$1',[h.id,h.lat]);}
 if(!rejected||await count()!==before)throw Error('Failed import was not rolled back');
 report.import=await applyExpansion(isolated,{attractionQuality:true});report.repeat=await applyExpansion(isolated,{attractionQuality:true});if(report.repeat.inserted.length||report.repeat.routesInserted)throw Error('Repeated import duplicated records');
 report.originalRowsPreserved=true;for(const [table,rows] of Object.entries(original))for(const row of rows){const current=(await isolated.query(`SELECT to_jsonb(t) data FROM ${table} t WHERE id=$1`,[row.id])).rows[0]?.data;if(JSON.stringify(current)!==JSON.stringify(row))throw Error('Original row changed');}
 report.dryRunRollback=true;report.failedImportRollback=true;

 const env={...runtime,DATABASE_URL:url.href,NODE_ENV:"test",JWT_SECRET:randomBytes(48).toString("hex"),PORT:"5310",CORS_ORIGIN:"http://localhost:4310",AUTH_RATE_LIMIT:"500",GENERATION_RATE_LIMIT:"100",CHAT_RATE_LIMIT:"20",GROQ_API_KEY:"",CHAT_FREE_PLAN_CONFIRMED:"false",CHAT_MOCK:"false",MAP_ROUTING_URL:""};
 backend=spawn(process.execPath,["--import","tsx","server.js"],{cwd:new URL("../backend/",import.meta.url),env,windowsHide:true,stdio:["ignore",serverLog,serverLog]});
 await waitFor("http://localhost:5310/ready");
 const production=process.argv.includes('--production');
 if(production)await run(process.execPath,['frontend/node_modules/vite/bin/vite.js','build','frontend'],{env:{...env,VITE_API_BASE_URL:'/api'},name:'attraction-quality-production-build'});
 const args=production?['--input-type=module','--eval',"import {preview} from 'vite'; await preview({preview:{host:'127.0.0.1',port:4310,strictPort:true,proxy:{'/api':'http://localhost:5310'}}});"]:["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4310","--strictPort"];
 frontend=spawn(process.execPath,args,{cwd:new URL("../frontend/",import.meta.url),env:{...env,VITE_API_BASE_URL:production?'/api':"http://localhost:5310/api"},windowsHide:true,stdio:"ignore"});report.productionPreview=production;
 await waitFor("http://localhost:4310");
 await run("python",["tests/frontend/attraction_quality.py"],{cwd:localRoot,env:{...env,FRONTEND_TEST_URL:"http://localhost:4310",API_TEST_URL:"http://localhost:5310/api"},name:"attraction-quality-browser"});
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{
 const stopped=[backend,frontend].filter(child=>child&&child.exitCode===null).map(child=>new Promise(resolve=>{child.once("exit",resolve);child.kill();}));await Promise.all(stopped);closeSync(serverLog);await isolated?.end();
 if(created)await admin.query("DROP DATABASE "+database+" WITH (FORCE)");
 await admin?.end();await localCompose(["up","-d","postgres"],"chat-test-db-private",runtime);await waitFor(runtime.CORS_ORIGIN+"/ready");
 report.finishedAt=new Date().toISOString();writeFileSync(new URL("../reports/attraction-quality-integration.json",import.meta.url),JSON.stringify(report,null,2));release();console.log(JSON.stringify(report));
}
