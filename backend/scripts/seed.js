import { guardSeed, captureSeedOwnership } from "./seedOwnership.js";
import { applyResearch } from "./seed-research.js";
import { applyResearchRoutes } from "./seed-research-routes.js";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createPool } from "./database.js";
import { loadSources, numericEntryFee } from "./csvSource.js";
import { auditSeed } from "./audit-seed.js";

export async function seedDatabase(pool, sources) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [70072026]);
    await guardSeed(client, sources);
    const destinationIds = new Map();
    const cities = [...new Set(Object.values(sources.datasets).flatMap(
      (data) => data.accepted.map((row) => row.destination_id),
    ))].sort();
    for (const slug of cities) {
      // Identity only, derived from the CSV city key. No invented city metadata.
      const name = slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
      await client.query(
        "INSERT INTO destinations (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
        [slug, name],
      );
      const { rows } = await client.query("SELECT id FROM destinations WHERE slug = $1", [slug]);
      destinationIds.set(slug, rows[0].id);
    }

    for (const row of sources.datasets["attractions.csv"].accepted) {
      const result = await client.query(`
        INSERT INTO attractions (
          external_id, destination_id, name, category, lat, lng, entry_fee,
          entry_fee_numeric, duration_hours, opening_time, closing_time, rating,
          source, provenance_status, source_row_hash
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'project_approved',$14)
        ON CONFLICT (external_id) DO UPDATE SET
          destination_id = EXCLUDED.destination_id, name = EXCLUDED.name,
          category = EXCLUDED.category, lat = EXCLUDED.lat, lng = EXCLUDED.lng,
          entry_fee = EXCLUDED.entry_fee, entry_fee_numeric = EXCLUDED.entry_fee_numeric,
          duration_hours = EXCLUDED.duration_hours, opening_time = EXCLUDED.opening_time,
          closing_time = EXCLUDED.closing_time, rating = EXCLUDED.rating, source = EXCLUDED.source
        WHERE attractions.source_row_hash = EXCLUDED.source_row_hash
          AND attractions.provenance_status = 'project_approved'
        RETURNING id
      `, [
        row.attraction_id, destinationIds.get(row.destination_id), row.name, row.category,
        row.latitude, row.longitude, row.entry_fee, numericEntryFee(row.entry_fee),
        row.average_visit_duration_hours, row.opening_time, row.closing_time,
        row.rating, row.source, row.source_row_hash,
      ]);
      if (result.rowCount !== 1) throw new Error("Refusing to overwrite unowned attraction: " + row.attraction_id);
    }

    for (const row of sources.datasets["hotels.csv"].accepted) {
      const result = await client.query(`
        INSERT INTO hotels (
          external_id, destination_id, name, lat, lng, price_per_night,
          rating, stay_type, source, provenance_status, source_row_hash
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'project_approved',$10)
        ON CONFLICT (external_id) DO UPDATE SET
          destination_id = EXCLUDED.destination_id, name = EXCLUDED.name,
          lat = EXCLUDED.lat, lng = EXCLUDED.lng, price_per_night = EXCLUDED.price_per_night,
          rating = EXCLUDED.rating, stay_type = EXCLUDED.stay_type, source = EXCLUDED.source
        WHERE hotels.source_row_hash = EXCLUDED.source_row_hash
          AND hotels.provenance_status = 'project_approved'
        RETURNING id
      `, [
        row.hotel_id, destinationIds.get(row.destination_id), row.hotel_name, row.latitude,
        row.longitude, row.price_per_night, row.rating, row.stay_type, row.source, row.source_row_hash,
      ]);
      if (result.rowCount !== 1) throw new Error("Refusing to overwrite unowned hotel: " + row.hotel_id);
    }

    for (const row of sources.datasets["restaurants.csv"].accepted) {
      const result = await client.query(`
        INSERT INTO restaurants (
          external_id, destination_id, name, lat, lng, rating, avg_cost_per_person,
          source, provenance_status, source_row_hash
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'project_approved',$9)
        ON CONFLICT (external_id) DO UPDATE SET
          destination_id = EXCLUDED.destination_id, name = EXCLUDED.name,
          lat = EXCLUDED.lat, lng = EXCLUDED.lng, rating = EXCLUDED.rating,
          avg_cost_per_person = EXCLUDED.avg_cost_per_person, source = EXCLUDED.source
        WHERE restaurants.source_row_hash = EXCLUDED.source_row_hash
          AND restaurants.provenance_status = 'project_approved'
        RETURNING id
      `, [
        row.restaurant_id, destinationIds.get(row.destination_id), row.name, row.latitude,
        row.longitude, row.rating, row.avg_cost_per_person, row.source, row.source_row_hash,
      ]);
      if (result.rowCount !== 1) throw new Error("Refusing to overwrite unowned restaurant: " + row.restaurant_id);
    }

    // None of today's route rows passes provenance filtering.
    // Future approved road-route snapshots must also resolve both real endpoints.
    const nodes = (await client.query(`
      SELECT external_id, id, destination_id, 'attraction' AS kind FROM attractions
      UNION ALL SELECT external_id, id, destination_id, 'hotel' FROM hotels
      UNION ALL SELECT external_id, id, destination_id, 'restaurant' FROM restaurants
    `)).rows;
    const nodeMap = new Map(nodes.filter((row) => row.external_id).map((row) => [row.external_id, row]));
    for (const row of sources.datasets["routes.csv"].accepted) {
      const from = nodeMap.get(row.source_attraction_id);
      const to = nodeMap.get(row.destination_attraction_id);
      const cityId = destinationIds.get(row.destination_id);
      if (!from || !to || from.destination_id !== cityId || to.destination_id !== cityId) {
        throw new Error("Approved route has missing or cross-city endpoints");
      }
      const result = await client.query(`
        INSERT INTO routes (
          destination_id, source_attraction_id, destination_attraction_id,
          source_hotel_id, destination_hotel_id, source_restaurant_id, destination_restaurant_id,
          distance_km, travel_time_minutes, transport_mode,
          source, source_date, provenance_status, source_row_hash
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'road',$10,$11,'project_approved',$12)
        ON CONFLICT (source_node_id, destination_node_id, transport_mode) DO UPDATE SET
          distance_km = EXCLUDED.distance_km, travel_time_minutes = EXCLUDED.travel_time_minutes,
          source = EXCLUDED.source, source_date = EXCLUDED.source_date
        WHERE routes.source_row_hash = EXCLUDED.source_row_hash
          AND routes.provenance_status = 'project_approved'
        RETURNING id
      `, [
        cityId, from.kind === "attraction" ? from.id : null, to.kind === "attraction" ? to.id : null,
        from.kind === "hotel" ? from.id : null, to.kind === "hotel" ? to.id : null,
        from.kind === "restaurant" ? from.id : null, to.kind === "restaurant" ? to.id : null,
        row.distance_km, row.travel_time_minutes, row.source, row.source_date ?? null, row.source_row_hash,
      ]);
      if (result.rowCount !== 1) throw new Error("Refusing to overwrite unowned route");
    }
    await applyResearch(client);
    await applyResearchRoutes(client);
    const report = await auditSeed(client, sources);
    await captureSeedOwnership(client, sources);
    await client.query("COMMIT");
    return report;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const sources = await loadSources();
  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({
      verificationBasis: sources.verificationBasis,
      files: Object.fromEntries(Object.entries(sources.datasets).map(([name, data]) => [
        name, { raw: data.raw.length, approved: data.accepted.length, excluded: data.rejected.length },
      ])),
    }, null, 2));
    return;
  }
  const pool = createPool();
  try {
    const report = await seedDatabase(pool, sources);
    if (process.env.NODE_ENV !== "production") {
      await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
      await writeFile(new URL("../reports/seed-report.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
    }
    console.log("Approved CSV rows and researched supplements seeded; simulated CSV routes excluded.");
    console.table(report.tableCounts);
    console.table(report.cityCounts);
    console.table(report.routeJoins);
    console.log("Approved counts match exactly: " + report.approvedCountsMatchExactly);
    console.log("Raw CSV counts match exactly: " + report.rawCsvCountsMatchExactly);
    console.log("Full SQL, exclusions, and results: backend/reports/seed-report.json");
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    // Validation messages are safe; PostgreSQL details can contain row contents.
    console.error(error.code ? "Seed failed; SQLSTATE: " + error.code : error.message);
    process.exitCode = 1;
  });
}
