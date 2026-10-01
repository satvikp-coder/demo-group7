import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createPool } from './database.js';

export async function migrate(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [70072027]);
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const files = [{name:'000-schema.sql', url:new URL('../../database/schema/schema.sql', import.meta.url)},
      ...(await readdir(new URL('../migrations/', import.meta.url))).filter(x => /^\d+.*\.sql$/.test(x)).sort().map(name => ({name,url:new URL('../migrations/'+name,import.meta.url)}))];
    for (const {name,url} of files) {
      const sql = await readFile(url, 'utf8');
      const hash = createHash('sha256').update(sql).digest('hex');
      const prior = (await client.query('SELECT sha256 FROM schema_migrations WHERE name=$1',[name])).rows[0];
      if (prior) { if (prior.sha256 !== hash) throw new Error('Applied migration checksum mismatch: '+name); continue; }
      const existing = name === '000-schema.sql' && (await client.query("SELECT to_regclass('public.users') AS users")).rows[0].users;
      if (existing) {
        // Adopt the previously installed canonical schema without replaying CREATE TABLE.
        for (const table of ['users','destinations','attractions','hotels','restaurants','routes','trips','itinerary_stops','budgets']) {
          if (!(await client.query('SELECT to_regclass($1) AS name',['public.'+table])).rows[0].name) throw new Error('Incomplete legacy schema');
        }
      } else await client.query(sql.replace(/^\s*(BEGIN|COMMIT);\s*$/gmi,''));
      await client.query('INSERT INTO schema_migrations(name,sha256) VALUES ($1,$2)',[name,hash]);
    }
    const role=process.env.DB_APP_ROLE;
    if (role) {
      if(!/^[a-z][a-z0-9_]{0,62}$/.test(role)) throw new Error('Invalid DB_APP_ROLE');
      await client.query(`GRANT USAGE ON SCHEMA public TO "${role}"`);
      await client.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO "${role}"`);
      await client.query(`REVOKE ALL ON schema_migrations,seed_managed_rows FROM "${role}"`);
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pool = createPool();
  try { await migrate(pool); console.log('Migrations complete.'); }
  catch(error) { console.error(error.code ? 'Migration failed: '+error.code : error.message); process.exitCode=1; }
  finally { await pool.end(); }
}
