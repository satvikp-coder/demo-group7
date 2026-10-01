// Sequential catalog mutation suites run against a disposable database.
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import pg from '../backend/node_modules/pg/lib/index.js';
import {createPool} from '../backend/scripts/database.js';
import {migrate} from '../backend/scripts/migrate.js';
import {seedDatabase} from '../backend/scripts/seed.js';
import {loadSources} from '../backend/scripts/csvSource.js';
import {npm,run,waitFor,reportDir,suiteLock} from './run.js';
const releaseLock=suiteLock();
const root=new URL('../',import.meta.url);
const admin=createPool(), db='heritage_suite_'+randomUUID().replaceAll('-','');
let isolated, backend, frontend, created=false;
const report={startedAt:new Date().toISOString(),verified:false,gates:[]};
const gate=async(name,task)=>{await task();report.gates.push({name,passed:true});writeFileSync(new URL('full-suite.json',reportDir),JSON.stringify(report,null,2));};
try {
 await gate('backend-unit-security',()=>npm(['--prefix','backend','test'],{name:'backend-unit'}));
 await gate('frontend-unit-and-reference-planner',()=>npm(['--prefix','frontend','test'],{name:'frontend-unit-planner'}));
 await gate('frontend-types',()=>npm(['--prefix','frontend','run','lint'],{name:'frontend-types'}));
 await gate('backend-syntax',()=>npm(['--prefix','backend','run','build'],{name:'backend-syntax'}));
 await gate('frontend-production-build-source-audit',()=>run(process.execPath,['tests/frontend/build-audit.mjs'],{name:'frontend-build',env:{...process.env,VITE_API_BASE_URL:'/api'}}));
 await admin.query(`CREATE DATABASE ${db}`);created=true;
 const url=new URL(process.env.DATABASE_URL);url.pathname='/'+db;
 const env={...process.env,DATABASE_URL:url.href,NODE_ENV:'test',JWT_SECRET:randomBytes(48).toString('hex'),CORS_ORIGIN:'http://localhost:4310',PORT:'5310',ALLOW_OPERATOR_REGISTRATION:'true',AUTH_RATE_LIMIT:'500',GENERATION_RATE_LIMIT:'100'};
 isolated=new pg.Pool({connectionString:url.href});
 await gate('fresh-migration-and-repeat-migration',async()=>{await migrate(isolated);await migrate(isolated);});
 await seedDatabase(isolated,await loadSources());
 await gate('reseed-preservation',()=>run(process.execPath,['backend/scripts/test-research-preservation.js'],{env,name:'reseed-preservation'}));
 for(const name of ['auth','destinations','trips','admin','db']) await gate('http-'+name,()=>npm(['--prefix','backend','run','test:'+name],{env,name:'http-'+name}));
 backend=spawn(process.execPath,['--import','tsx','server.js'],{cwd:new URL('../backend/',import.meta.url),env,windowsHide:true,stdio:'ignore'});
 await waitFor('http://localhost:5310/ready');
 frontend=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4310','--strictPort'],{cwd:new URL('../frontend/',import.meta.url),env:{...env,VITE_API_BASE_URL:'http://localhost:5310/api'},windowsHide:true,stdio:'ignore'});
 await waitFor('http://localhost:4310');
 const browserEnv={...env,FRONTEND_TEST_URL:'http://localhost:4310',API_TEST_URL:'http://localhost:5310/api'};
 await gate('browser-development-full-controls',()=>npm(['--prefix','backend','run','test:frontend'],{env:browserEnv,name:'browser-development'}));
 await gate('api-client-malformed-responses',()=>run('python',['tests/frontend/api_client_browser.py'],{env:browserEnv,name:'api-client-browser'}));
 await gate('research-browser',()=>run(process.execPath,['backend/scripts/test-research-browser.js'],{env:browserEnv,name:'research-browser'}));
 await gate('dependency-backend',()=>npm(['--prefix','backend','audit','--audit-level=low'],{name:'audit-backend'}));
 await gate('dependency-frontend',()=>npm(['--prefix','frontend','audit','--audit-level=low'],{name:'audit-frontend'}));
 await gate('source-and-ui-preservation',()=>run(process.execPath,['scripts/source-audit.js'],{name:'source-audit'}));
 report.verified=true;
} catch(error){report.failure=error.message;process.exitCode=1;}
finally {
 backend?.kill();frontend?.kill();
 if(isolated)await isolated.end();
 if(created){await admin.query(`DROP DATABASE ${db} WITH (FORCE)`);report.isolatedDatabaseRemoved=true;}
 await admin.end();report.finishedAt=new Date().toISOString();
 writeFileSync(new URL('full-suite.json',reportDir),JSON.stringify(report,null,2));console.log(JSON.stringify(report));releaseLock();
}
