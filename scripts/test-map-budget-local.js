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
const release=suiteLock(),runtime=localEnvironment(),database="heritage_map_"+randomUUID().replaceAll("-","");
const url=new URL(runtime.DATABASE_ADMIN_URL);url.hostname="127.0.0.1";url.port="55434";
let admin,isolated,created=false,backend,frontend;
const serverLog=openSync(new URL("../backend/reports/production/map-budget-server.txt",import.meta.url),"w");
const report={startedAt:new Date().toISOString(),verified:false};
try{
 await run("docker",[...localArgs,"-f","compose.staging.yml","up","-d","postgres"],{env:{...runtime,PG_TEST_PORT:"55434"},cwd:localRoot,name:"chat-test-private-db-access"});
 await waitFor(runtime.CORS_ORIGIN+"/ready");
 admin=new pg.Pool({connectionString:url.href});await admin.query("CREATE DATABASE "+database);created=true;url.pathname="/"+database;
 isolated=new pg.Pool({connectionString:url.href});
 await migrate(isolated);await seedDatabase(isolated,await loadSources());await applyExpansion(isolated);await applyExpansion(isolated,{phase2:true});await applyEnrichment(isolated);await applyExpansion(isolated,{hotelCoverage:true});
 const env={...runtime,DATABASE_URL:url.href,NODE_ENV:"test",JWT_SECRET:randomBytes(48).toString("hex"),PORT:"5310",CORS_ORIGIN:"http://localhost:4310",AUTH_RATE_LIMIT:"500",CHAT_RATE_LIMIT:"20",GROQ_API_KEY:"",CHAT_FREE_PLAN_CONFIRMED:"false",CHAT_MOCK:"false",MAP_ROUTING_URL:""};
 backend=spawn(process.execPath,["--import","tsx","server.js"],{cwd:new URL("../backend/",import.meta.url),env,windowsHide:true,stdio:["ignore",serverLog,serverLog]});
 await waitFor("http://localhost:5310/ready");
 const production=process.argv.includes('--production');
 if(production)await run(process.execPath,['frontend/node_modules/vite/bin/vite.js','build','frontend'],{env:{...env,VITE_API_BASE_URL:'/api'},name:'map-budget-production-build'});
 const args=production?['--input-type=module','--eval',"import {preview} from 'vite'; await preview({preview:{host:'127.0.0.1',port:4310,strictPort:true,proxy:{'/api':'http://localhost:5310'}}});"]:["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4310","--strictPort"];
 frontend=spawn(process.execPath,args,{cwd:new URL("../frontend/",import.meta.url),env:{...env,VITE_API_BASE_URL:production?'/api':"http://localhost:5310/api"},windowsHide:true,stdio:"ignore"});report.productionPreview=production;
 await waitFor("http://localhost:4310");
 await run("python",["tests/frontend/map_budget.py"],{cwd:localRoot,env:{...env,FRONTEND_TEST_URL:"http://localhost:4310",API_TEST_URL:"http://localhost:5310/api"},name:"map-budget-browser"});
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{
 const stopped=[backend,frontend].filter(child=>child&&child.exitCode===null).map(child=>new Promise(resolve=>{child.once("exit",resolve);child.kill();}));await Promise.all(stopped);closeSync(serverLog);await isolated?.end();
 if(created)await admin.query("DROP DATABASE "+database+" WITH (FORCE)");
 await admin?.end();await localCompose(["up","-d","postgres"],"chat-test-db-private",runtime);await waitFor(runtime.CORS_ORIGIN+"/ready");
 report.finishedAt=new Date().toISOString();writeFileSync(new URL("../reports/map-budget-integration.json",import.meta.url),JSON.stringify(report,null,2));release();console.log(JSON.stringify(report));
}
