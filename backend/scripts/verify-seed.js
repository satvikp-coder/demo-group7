import { createPool } from "./database.js";
import { loadSources } from "./csvSource.js";
import { auditSeed } from "./audit-seed.js";

const pool = createPool();
let client;
try {
  const sources = await loadSources();
  client = await pool.connect();
  await client.query("BEGIN");
  const report = await auditSeed(client, sources);
  await client.query("COMMIT");
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (client) await client.query("ROLLBACK");
  console.error(error.code ? "Verification failed; SQLSTATE: " + error.code : error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
