import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createPool} from './database.js';
import {loadSources} from './csvSource.js';
import {seedDatabase} from './seed.js';
import {auditResearchCatalog} from './audit-research.js';
const pool=createPool(), tables=['destinations','attractions','hotels','restaurants','routes'];
async function snapshot(){const result={};for(const table of tables)result[table]=(await pool.query(`SELECT * FROM ${table} ORDER BY id`)).rows;return result;}
try {
 const sources=await loadSources(),before=await snapshot();
 for(let i=0;i<2;i++){await seedDatabase(pool,sources);assert.deepEqual(await snapshot(),before,'Normal reseed changed catalog values or identities');}
 const client=await pool.connect();
 let rejected=false;
 try {
  await client.query('BEGIN');
  await client.query("UPDATE attractions SET description='Deliberate rollback-only audit probe' WHERE external_id='a101'");
  await assert.rejects(()=>auditResearchCatalog(client,sources),/Research field mismatch a101.description/);
  rejected=true;
 }finally{await client.query('ROLLBACK');client.release();}
 assert.deepEqual(await snapshot(),before,'Rollback failed to preserve catalog');
 const report={checkedAt:new Date().toISOString(),verified:true,reseedPasses:2,allCatalogValuesAndIdsPreserved:true,incorrectFieldRejected:rejected,probeRolledBack:true,counts:Object.fromEntries(tables.map(t=>[t,before[t].length]))};
 writeFileSync(new URL('../reports/research-preservation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await pool.end();}
