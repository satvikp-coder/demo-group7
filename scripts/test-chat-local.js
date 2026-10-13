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
const release=suiteLock(),runtime=localEnvironment(),database="heritage_chat_"+randomUUID().replaceAll("-","");
const url=new URL(runtime.DATABASE_ADMIN_URL);url.hostname="127.0.0.1";url.port="55434";
let admin,isolated,created=false,backend,frontend;
const serverLog=openSync(new URL("../backend/reports/production/chat-browser-server.txt",import.meta.url),"w");
const report={startedAt:new Date().toISOString(),liveGroq:"LIVE_GROQ_NOT_VERIFIED",verified:false};
try{
 await run("docker",[...localArgs,"-f","compose.staging.yml","up","-d","postgres"],{env:{...runtime,PG_TEST_PORT:"55434"},cwd:localRoot,name:"chat-test-private-db-access"});
 await waitFor(runtime.CORS_ORIGIN+"/ready");
 admin=new pg.Pool({connectionString:url.href});await admin.query("CREATE DATABASE "+database);created=true;url.pathname="/"+database;
 isolated=new pg.Pool({connectionString:url.href});
 await migrate(isolated);await seedDatabase(isolated,await loadSources());await applyExpansion(isolated);await applyExpansion(isolated,{phase2:true});await applyEnrichment(isolated);await applyExpansion(isolated,{hotelCoverage:true});
 const env={...runtime,DATABASE_URL:url.href,NODE_ENV:"test",JWT_SECRET:randomBytes(48).toString("hex"),PORT:"5310",CORS_ORIGIN:"http://localhost:4310",AUTH_RATE_LIMIT:"500",CHAT_RATE_LIMIT:"20",GROQ_API_KEY:"",CHAT_FREE_PLAN_CONFIRMED:"false",CHAT_MOCK:"false"};
 await run(process.execPath,["--import","./backend/node_modules/tsx/dist/loader.mjs","backend/scripts/test-chat-db.js"],{cwd:localRoot,env,name:"chat-database-security"});
 backend=spawn(process.execPath,["--import","tsx","scripts/chat-test-server.js"],{cwd:new URL("../backend/",import.meta.url),env,windowsHide:true,stdio:["ignore",serverLog,serverLog]});
 await waitFor("http://localhost:5310/ready");
 frontend=spawn(process.execPath,["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4310","--strictPort"],{cwd:new URL("../frontend/",import.meta.url),env:{...env,VITE_API_BASE_URL:"http://localhost:5310/api"},windowsHide:true,stdio:"ignore"});
 await waitFor("http://localhost:4310");
 await run("python",["tests/frontend/heritage_chat.py"],{cwd:localRoot,env:{...env,FRONTEND_TEST_URL:"http://localhost:4310",API_TEST_URL:"http://localhost:5310/api"},name:"chat-browser-three-widths"});
 if(process.argv.includes("--live")){
  await run(process.execPath,["--import","./backend/node_modules/tsx/dist/loader.mjs","backend/scripts/test-chat-live.js"],{cwd:localRoot,env:{...env,GROQ_API_KEY:runtime.GROQ_API_KEY,CHAT_FREE_PLAN_CONFIRMED:runtime.CHAT_FREE_PLAN_CONFIRMED,GROQ_MODEL:runtime.GROQ_MODEL},name:"chat-live-free-plan"});
  // Restart only this isolated API with real Groq; exercise the actual widget/auth/client.
  const stopped=new Promise(resolve=>backend.once("exit",resolve));backend.kill();await stopped;
  const liveEnv={...env,GROQ_API_KEY:runtime.GROQ_API_KEY,CHAT_FREE_PLAN_CONFIRMED:runtime.CHAT_FREE_PLAN_CONFIRMED,GROQ_MODEL:runtime.GROQ_MODEL,CHAT_TEST_LIVE_PROVIDER:"true"};
  backend=spawn(process.execPath,["--import","tsx","scripts/chat-test-server.js"],{cwd:new URL("../backend/",import.meta.url),env:liveEnv,windowsHide:true,stdio:["ignore",serverLog,serverLog]});
  await waitFor("http://localhost:5310/ready");
  await run("python",["tests/frontend/heritage_chat_live.py"],{cwd:localRoot,env:{...env,FRONTEND_TEST_URL:"http://localhost:4310",API_TEST_URL:"http://localhost:5310/api"},name:"chat-live-browser"});
  report.liveGroq="VERIFIED";
 }
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{
 const stopped=[backend,frontend].filter(child=>child&&child.exitCode===null).map(child=>new Promise(resolve=>{child.once("exit",resolve);child.kill();}));await Promise.all(stopped);closeSync(serverLog);await isolated?.end();
 if(created)await admin.query("DROP DATABASE "+database+" WITH (FORCE)");
 await admin?.end();await localCompose(["up","-d","postgres"],"chat-test-db-private",runtime);await waitFor(runtime.CORS_ORIGIN+"/ready");
 report.finishedAt=new Date().toISOString();writeFileSync(new URL("../reports/heritage-guide-integration.json",import.meta.url),JSON.stringify(report,null,2));release();console.log(JSON.stringify(report));
}
