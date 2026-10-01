import {createPool} from './database.js';
import {loadSources} from './csvSource.js';
import {auditResearchCatalog} from './audit-research.js';
import {captureSeedOwnership} from './seedOwnership.js';
// Reconciliation cannot change tourism values. It succeeds only after manifests
// exactly describe the reviewed live approved rows; unrelated rows are excluded.
if(!process.argv.includes('--reviewed'))throw new Error('Review live edits and manifests first; use --reviewed to acknowledge reconciliation');
const pool=createPool(),client=await pool.connect();
try{
 await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock($1)',[70072026]);
 const sources=await loadSources();await auditResearchCatalog(client,sources);await captureSeedOwnership(client,sources);
 await client.query('COMMIT');console.log('Reviewed seed ownership reconciled; no catalog/user/trip values changed.');
}catch(error){await client.query('ROLLBACK');console.error(error.code?'Seed reconciliation failed: '+error.code:error.message);process.exitCode=1;}
finally{client.release();await pool.end();}
