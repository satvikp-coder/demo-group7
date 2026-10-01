// Fresh setup verification uses a disposable database, never the working database.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import pg from 'pg';
import {createPool} from './database.js';
import {loadSources} from './csvSource.js';
import {seedDatabase} from './seed.js';
const admin=createPool();
const name='heritage_verify_'+randomUUID().replaceAll('-','');
assert.match(name,/^heritage_verify_[a-f0-9]{32}$/);
let isolated,created=false;
const report={checkedAt:new Date().toISOString(),verified:false,isolatedDatabase:true};
try {
  await admin.query(`CREATE DATABASE ${name}`);created=true;
  const url=new URL(process.env.DATABASE_URL);url.pathname='/'+name;
  isolated=new pg.Pool({connectionString:url.href,max:2});
  await isolated.query(readFileSync(new URL('../../database/schema/schema.sql',import.meta.url),'utf8'));
  await isolated.query(readFileSync(new URL('../migrations/001-trip-generation.sql',import.meta.url),'utf8'));
  const sources=await loadSources();
  await seedDatabase(isolated,sources);
  const tables=['destinations','attractions','hotels','restaurants','routes'];
  async function snapshot(){const result={};for(const t of tables)result[t]=(await isolated.query(`SELECT * FROM ${t} ORDER BY id`)).rows;return result;}
  const first=await snapshot();
  await seedDatabase(isolated,sources);
  assert.deepEqual(await snapshot(),first);
  assert.deepEqual(Object.fromEntries(tables.map(t=>[t,first[t].length])),{destinations:8,attractions:25,hotels:11,restaurants:12,routes:131});
  report.counts=Object.fromEntries(tables.map(t=>[t,first[t].length]));
  report.schemaAndMigrationApplied=true;report.reseedPreservedAllIdsAndValues=true;report.verified=true;
} catch(e) { report.error=e.code??e.message;process.exitCode=1; }
finally {
  if(isolated)await isolated.end();
  if(created){await admin.query(`DROP DATABASE ${name}`);report.disposableDatabaseRemoved=true;}
  await admin.end();
  writeFileSync(new URL('../reports/clean-startup-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
}
