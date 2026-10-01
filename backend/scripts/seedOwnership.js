import { tableKeys, loadResearch } from './seed-research.js';
import { auditResearchCatalog } from './audit-research.js';

export async function guardSeed(client, sources) {
  await client.query('CREATE TABLE IF NOT EXISTS seed_managed_rows (table_name text NOT NULL, identity text NOT NULL, snapshot jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(table_name,identity))');
  const managed = (await client.query('SELECT * FROM seed_managed_rows')).rows;
  if (!managed.length) {
    const count = (await client.query('SELECT count(*)::int AS n FROM destinations')).rows[0].n;
    // Existing installations must exactly match approved fields before first adoption.
    if (count) await auditResearchCatalog(client, sources, {allowDirectionalPending:true});
  }
  for (const row of managed) {
    const key = row.table_name === 'routes' ? 'source_row_hash' : tableKeys[row.table_name];
    if (!key) throw new Error('Invalid seed ownership table');
    const actual = (await client.query(`SELECT to_jsonb(t) - 'id' - 'created_at' AS value FROM ${row.table_name} t WHERE ${key}=$1`,[row.identity])).rows[0]?.value;
    // JSONB normalizes dates/numeric types consistently; preserve operator changes.
    const equal = (await client.query('SELECT $1::jsonb = $2::jsonb AS equal',[actual ?? null,row.snapshot])).rows[0].equal;
    if (!equal) throw new Error('Seed refused: managed catalog was edited; review changes before updating '+row.table_name);
  }
}

export async function captureSeedOwnership(client, sources) {
  const owned = new Map(loadResearch().map(r => [r.table+':'+r.key, {table:r.table,key:r.key}]));
  for (const [file,data] of Object.entries(sources.datasets)) {
    const table = file.replace('.csv','');
    if (!tableKeys[table]) continue;
    for (const row of data.accepted) {
      const key = row.attraction_id ?? row.hotel_id ?? row.restaurant_id;
      owned.set(table+':'+key,{table,key});
      owned.set('destinations:'+row.destination_id,{table:'destinations',key:row.destination_id});
    }
  }
  for (const {table,key} of owned.values()) {
    await client.query(`INSERT INTO seed_managed_rows(table_name,identity,snapshot) SELECT $1,$2,to_jsonb(t)-'id'-'created_at' FROM ${table} t WHERE ${tableKeys[table]}=$2 ON CONFLICT(table_name,identity) DO UPDATE SET snapshot=EXCLUDED.snapshot,updated_at=now()`,[table,key]);
  }
  await client.query("INSERT INTO seed_managed_rows(table_name,identity,snapshot) SELECT 'routes',source_row_hash,to_jsonb(t)-'id'-'created_at' FROM routes t WHERE source_row_hash IS NOT NULL ON CONFLICT(table_name,identity) DO UPDATE SET snapshot=EXCLUDED.snapshot,updated_at=now()");
}
