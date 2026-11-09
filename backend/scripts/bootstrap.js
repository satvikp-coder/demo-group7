// Start-up preparation for hosts without a pre-deploy step or shell (for example Render's free plan).
//   1. Apply pending migrations. This is idempotent: advisory-locked, checksummed, and a no-op when current.
//   2. Seed the approved catalog ONLY when the database has no destinations at all (a brand-new database).
// An existing catalog is never reseeded here; refresh approved facts with the guarded `npm run db:seed`
// as described in docs/PRODUCTION.md. Run it as:  node scripts/bootstrap.js && node --import tsx server.js
import { createPool } from "./database.js";
import { migrate } from "./migrate.js";
import { loadSources } from "./csvSource.js";
import { seedDatabase } from "./seed.js";

const pool = createPool();
try {
  await migrate(pool);
  console.log("Migrations are up to date.");
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM destinations");
  if (rows[0].n === 0) {
    console.log("Empty catalog detected: seeding the approved data once.");
    await seedDatabase(pool, await loadSources());
    console.log("Initial seed complete.");
  } else {
    console.log(`Catalog already present (${rows[0].n} destinations): seed skipped.`);
  }
} catch (error) {
  // Validation messages are safe; PostgreSQL details can contain row contents.
  console.error(error.code ? "Bootstrap failed; SQLSTATE: " + error.code : error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
