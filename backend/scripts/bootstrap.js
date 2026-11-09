// Start-up preparation for hosts without a pre-deploy step or shell (for example Render's free plan).
//   1. Apply pending migrations. This is idempotent: advisory-locked, checksummed, and a no-op when current.
//   2. Seed the approved catalog ONLY when the database has no destinations at all (a brand-new database).
//   3. Apply the four additive catalog releases (more hotels, attractions and road routes) that have not been
//      applied yet. They only insert: existing rows are never updated or deleted, and each release is skipped
//      once its records exist, so running this on every start is safe.
// An existing catalog is never reseeded here; refresh approved facts with the guarded `npm run db:seed`
// as described in docs/PRODUCTION.md. Hosts start the API with scripts/start.js, which calls this first.
import { pathToFileURL } from "node:url";
import { createPool } from "./database.js";
import { migrate } from "./migrate.js";
import { loadSources } from "./csvSource.js";
import { seedDatabase } from "./seed.js";
import { applyExpansion } from "./expand-catalog.js";

// Same order as `npm run local:expand`, `local:enrich`, `local:hotel-coverage`, `local:attractions`.
const RELEASES = [
  { id: "20261009", label: "expansion", options: {} },
  { id: "20261010", label: "phase 2 enrichment", options: { phase2: true } },
  { id: "20261011", label: "hotel coverage", options: { hotelCoverage: true } },
  { id: "20261020", label: "attraction quality", options: { attractionQuality: true } },
];

// A release leaves rows whose external_id starts with exp-<release>-, so their presence means it was applied.
async function releaseApplied(pool, id) {
  const { rows } = await pool.query(
    "SELECT (EXISTS (SELECT 1 FROM hotels WHERE external_id LIKE $1) OR EXISTS (SELECT 1 FROM attractions WHERE external_id LIKE $1)) AS done",
    [`exp-${id}-%`],
  );
  return rows[0].done;
}

export async function bootstrap() {
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
    for (const release of RELEASES) {
      if (await releaseApplied(pool, release.id)) {
        console.log(`Catalog release ${release.id} (${release.label}) already applied.`);
        continue;
      }
      const report = await applyExpansion(pool, release.options);
      console.log(`Catalog release ${release.id} (${release.label}): ${report.inserted.length} records and ${report.routesInserted} routes added.`);
    }
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  bootstrap().catch(error => {
    // Validation messages are safe; PostgreSQL details can contain row contents.
    console.error(error.code ? "Bootstrap failed; SQLSTATE: " + error.code : error.message);
    process.exitCode = 1;
  });
}
