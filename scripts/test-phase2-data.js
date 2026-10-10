// Real migrations and additive imports, strictly isolated from the running catalog.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {run,waitFor,suiteLock} from './run.js';
import {randomUUID,randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {createPool} from '../backend/scripts/database.js';
import {migrate} from '../backend/scripts/migrate.js';
import {seedDatabase} from '../backend/scripts/seed.js';
import {loadSources} from '../backend/scripts/csvSource.js';
import {applyExpansion} from '../backend/scripts/expand-catalog.js';
const release=suiteLock();
const admin=createPool(),database='heritage_audit_'+randomUUID().replaceAll('-','');
let isolated,backend,frontend,created=false;
const production=process.argv.includes('--production');
const report={productionPreview:production,startedAt:new Date().toISOString(),verified:false,checks:[]};
try{
 await admin.query(`CREATE DATABASE ${database}`);created=true;
 const previous=process.env.DATABASE_URL,url=new URL(previous);url.pathname='/'+database;
 process.env.DATABASE_URL=url.href;isolated=createPool();process.env.DATABASE_URL=previous;
 await migrate(isolated);await seedDatabase(isolated,await loadSources());await applyExpansion(isolated);
 const tables=['destinations','attractions','hotels','restaurants','routes','users','trips'];
 const snapshot=async()=>Object.fromEntries(await Promise.all(tables.map(async t=>[t,(await isolated.query(`SELECT * FROM ${t} ORDER BY id`)).rows])));
 const before=await snapshot();
 await applyExpansion(isolated,{phase2:true,dryRun:true});assert.deepEqual(await snapshot(),before);report.checks.push('Dry run rolls back all records');
 // Fail after the first insert; the entire transaction must roll back.
 await isolated.query("CREATE FUNCTION phase2_reject() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.external_id LIKE 'exp-20261010-%' THEN RAISE EXCEPTION 'isolated rollback probe'; END IF; RETURN NEW; END $$");
 await isolated.query('CREATE TRIGGER phase2_probe BEFORE INSERT ON attractions FOR EACH ROW EXECUTE FUNCTION phase2_reject()');
 await assert.rejects(applyExpansion(isolated,{phase2:true}),/isolated rollback probe/);
 assert.deepEqual(await snapshot(),before);report.checks.push('Failed import rolls back earlier hotel insertion');
 await isolated.query('DROP TRIGGER phase2_probe ON attractions');await isolated.query('DROP FUNCTION phase2_reject()');
 const imported=await applyExpansion(isolated,{phase2:true}),after=await snapshot();
 assert.equal(imported.inserted.length,31);
 for(const t of tables)for(const original of before[t])assert.deepEqual(after[t].find(r=>r.id===original.id),original);
 report.checks.push('Every original row preserved byte-for-byte in JSON values');
 const repeated=await applyExpansion(isolated,{phase2:true});assert.equal(repeated.inserted.length,0);assert.equal(repeated.routesInserted,0);assert.deepEqual(await snapshot(),after);
 report.checks.push('Repeated import preserves IDs and values without duplicates');
 report.before=Object.fromEntries(tables.map(t=>[t,before[t].length]));report.after=Object.fromEntries(tables.map(t=>[t,after[t].length]));report.imported=imported;
 const env={...process.env,DATABASE_URL:url.href,NODE_ENV:'test',JWT_SECRET:randomBytes(48).toString('hex'),CORS_ORIGIN:'http://localhost:4310',PORT:'5310',AUTH_RATE_LIMIT:'500',GENERATION_RATE_LIMIT:'100'};
 backend=spawn(process.execPath,['--import','tsx','server.js'],{cwd:new URL('../backend/',import.meta.url),env,windowsHide:true,stdio:'ignore'});await waitFor('http://localhost:5310/ready');
 await run(process.execPath,['backend/scripts/test-phase2-accommodation-api.js'],{env:{...env,API_TEST_URL:'http://localhost:5310/api'},name:'phase2-accommodation-api'});
 report.checks.push('Real authenticated API validates nights, room totals, dates and persisted generation for 10 cases');
 if(production)await run(process.execPath,['frontend/node_modules/vite/bin/vite.js','build','frontend'],{env:{...env,VITE_API_BASE_URL:'/api'},name:'phase2-production-build'});
 const frontendArgs=production?['--input-type=module','--eval',"import {preview} from 'vite'; await preview({preview:{host:'127.0.0.1',port:4310,strictPort:true,proxy:{'/api':'http://localhost:5310'}}});"]:['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4310','--strictPort'];
 frontend=spawn(process.execPath,frontendArgs,{cwd:new URL('../frontend/',import.meta.url),env:{...env,VITE_API_BASE_URL:production?'/api':'http://localhost:5310/api'},windowsHide:true,stdio:'ignore'});await waitFor('http://localhost:4310');
 await run('python',['tests/frontend/itinerary_phase2.py'],{env:{...env,FRONTEND_TEST_URL:'http://localhost:4310',API_TEST_URL:'http://localhost:5310/api'},name:'phase2-browser'});
 report.checks.push('Real browser explicit zero-night generation, refresh, decoded images and overflow at 1440/768/390');
 report.verified=true;
}catch(e){report.failure=e.message;process.exitCode=1;}
finally{
 frontend?.kill();backend?.kill();await isolated?.end();if(created){await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);report.isolatedDatabaseRemoved=true;}await admin.end();
 report.finishedAt=new Date().toISOString();writeFileSync(new URL('../reports/phase2-import-tests.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));release();
}
