// Back up and upgrade the existing developer installation without changing users,
// trips, approved prices or entity IDs. Newly added evidence columns are excluded
// from the pre/post equality comparison and checked separately by the seed audit.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createPool} from '../backend/scripts/database.js';
import {databaseArchive} from '../backend/scripts/backup.js';
import {migrate} from '../backend/scripts/migrate.js';
import {seedDatabase} from '../backend/scripts/seed.js';
import {loadSources} from '../backend/scripts/csvSource.js';
const pool=createPool(),report={checkedAt:new Date().toISOString(),verified:false};
const tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets'];
async function snapshot(){
 const result={};
 for(const table of tables)result[table]=(await pool.query(`SELECT to_jsonb(t)-'provenance_review'-'reverse_distance_km'-'reverse_travel_time_minutes' AS row FROM ${table} t ORDER BY id`)).rows.map(r=>r.row);
 return result;
}
try{
 const before=await snapshot();report.beforeCounts=Object.fromEntries(tables.map(t=>[t,before[t].length]));
 mkdirSync('backups',{recursive:true});
 const archive='backups/pre-production-'+Date.now()+'.dump';
 await databaseArchive('backup',archive,{...process.env,PG_TOOLS_CONTAINER:process.env.PG_TOOLS_CONTAINER??'group07-heritage-postgres'});report.backupCreated=true;
 await migrate(pool);await migrate(pool);
 const sources=await loadSources();await seedDatabase(pool,sources);await seedDatabase(pool,sources);
 assert.deepEqual(await snapshot(),before,'Existing identities, facts or user data changed');
 report.originalRowsPreserved=true;report.reseedPasses=2;report.verified=true;
 report.fieldReviewedRows=(await pool.query("SELECT (SELECT count(*) FROM attractions WHERE provenance_review IS NOT NULL)+(SELECT count(*) FROM hotels WHERE provenance_review IS NOT NULL)+(SELECT count(*) FROM restaurants WHERE provenance_review IS NOT NULL) AS n")).rows[0].n;
}catch(error){report.failure=error.code??error.message;process.exitCode=1;}
finally{await pool.end();writeFileSync(new URL('../backend/reports/production-local-upgrade.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
