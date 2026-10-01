// Local Compose only: upgrade schema every start, import approved data only once.
import {createPool} from './database.js';
import {migrate} from './migrate.js';
import {seedDatabase} from './seed.js';
import {loadSources} from './csvSource.js';
import {auditSeed} from './audit-seed.js';
const pool=createPool();
try {
 await migrate(pool);
 const managed=(await pool.query('SELECT count(*)::int n FROM seed_managed_rows')).rows[0].n;
 if(!managed){
  const sources=await loadSources();
  await seedDatabase(pool,sources);
  const client=await pool.connect();
  try{await client.query('BEGIN');await auditSeed(client,sources);await client.query('COMMIT');}
  catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
  console.log(JSON.stringify({event:'local_database_initialized',approvedDataImported:true}));
 }else console.log(JSON.stringify({event:'local_database_preserved',approvedDataImported:false}));
}catch(error){console.error(JSON.stringify({event:'local_database_bootstrap_failed',code:error.code??'CONFIGURATION_OR_DATA'}));process.exitCode=1;}
finally{await pool.end();}
