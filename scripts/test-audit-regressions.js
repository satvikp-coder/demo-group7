// Targeted real-stack regressions on a separately created/seeded disposable DB.
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {createPool} from '../backend/scripts/database.js';
import {migrate} from '../backend/scripts/migrate.js';
import {seedDatabase} from '../backend/scripts/seed.js';
import {loadSources} from '../backend/scripts/csvSource.js';
import {npm,run,waitFor,suiteLock} from './run.js';
const release=suiteLock(),admin=createPool(),database='heritage_audit_'+randomUUID().replaceAll('-','');
const phase=process.argv.includes('--before')?'before':'after';
let backend,frontend,isolated,created=false;
const report={phase,startedAt:new Date().toISOString(),verified:false,isolatedDatabase:database};
try {
 await admin.query(`CREATE DATABASE ${database}`);created=true;
 const url=new URL(process.env.DATABASE_URL);url.pathname='/'+database;
 const env={...process.env,DATABASE_URL:url.href,NODE_ENV:'test',JWT_SECRET:randomBytes(48).toString('hex'),CORS_ORIGIN:'http://localhost:4310',PORT:'5310',AUTH_RATE_LIMIT:'500'};
 isolated=createPoolWith(env);
 await migrate(isolated);await seedDatabase(isolated,await loadSources());
 backend=spawn(process.execPath,['--import','tsx','server.js'],{cwd:new URL('../backend/',import.meta.url),env,windowsHide:true,stdio:'ignore'});await waitFor('http://localhost:5310/ready');
 frontend=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4310','--strictPort'],{cwd:new URL('../frontend/',import.meta.url),env:{...env,VITE_API_BASE_URL:'http://localhost:5310/api'},windowsHide:true,stdio:'ignore'});await waitFor('http://localhost:4310');
 await run('python',['tests/frontend/audit_regressions.py',phase],{env:{...env,FRONTEND_TEST_URL:'http://localhost:4310',API_TEST_URL:'http://localhost:5310/api'},name:'audit-regressions-'+phase});
 report.verified=true;
}catch(error){report.failure=error.message;process.exitCode=1;}
finally {
 backend?.kill();frontend?.kill();await isolated?.end();
 if(created){await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);report.isolatedDatabaseRemoved=true;}
 await admin.end();report.finishedAt=new Date().toISOString();writeFileSync(new URL('../reports/targeted-'+phase+'-runner.json',import.meta.url),JSON.stringify(report,null,2));release();console.log(JSON.stringify(report));
}
function createPoolWith(env){const old=process.env.DATABASE_URL;process.env.DATABASE_URL=env.DATABASE_URL;try{return createPool()}finally{process.env.DATABASE_URL=old}}
