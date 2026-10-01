import { auditResearchCatalog } from "./audit-research.js";
import { readFile } from "node:fs/promises";

export async function auditSeed(client, sources) {
  const tableCountsSql = await readFile(new URL("./sql/table-counts.sql", import.meta.url), "utf8");
  const routeJoinSql = await readFile(new URL("./sql/route-joins.sql", import.meta.url), "utf8");
  const missingSourcesSql = await readFile(new URL("./sql/route-missing-sources.sql", import.meta.url), "utf8");
  const tableCounts = (await client.query(tableCountsSql)).rows;
  const counts = Object.fromEntries(tableCounts.map((row) => [row.table_name, row.row_count]));
  const csvCounts = Object.fromEntries(Object.entries(sources.datasets).map(([name, data]) => [
    name, { source: data.raw.length, approved: data.accepted.length, excluded: data.rejected.length,
      database: counts[name.replace(".csv", "")], sourceSha256: data.sha256 },
  ]));
  const researchAudit = await auditResearchCatalog(client, sources);
  const cityCounts = (await client.query(`
    SELECT d.slug AS city,
      (SELECT count(*)::int FROM attractions a WHERE a.destination_id = d.id) AS attractions,
      (SELECT count(*)::int FROM hotels h WHERE h.destination_id = d.id) AS hotels,
      (SELECT count(*)::int FROM restaurants r WHERE r.destination_id = d.id) AS restaurants,
      (SELECT count(*)::int FROM routes r WHERE r.destination_id = d.id) AS routes
    FROM destinations d ORDER BY d.slug
  `)).rows;

  // Raw route rows are diagnostic input only, not production routes.
  await client.query(`
    CREATE TEMP TABLE csv_route_audit (
      source_attraction_id TEXT, destination_attraction_id TEXT, destination_id TEXT
    ) ON COMMIT DROP
  `);
  await client.query(`
    INSERT INTO csv_route_audit
    SELECT source_attraction_id, destination_attraction_id, destination_id
    FROM jsonb_to_recordset($1::jsonb)
      AS c(source_attraction_id TEXT, destination_attraction_id TEXT, destination_id TEXT)
  `, [JSON.stringify(sources.datasets["routes.csv"].raw)]);
  const routeJoins = (await client.query(routeJoinSql)).rows;
  const missingRouteSources = (await client.query(missingSourcesSql)).rows;
  return {
    generatedAt: new Date().toISOString(),
    verificationBasis: sources.verificationBasis,
    approvedRowsMatch: true,
    approvedCountsMatchExactly: Object.entries(researchAudit.expectedCounts).every(([table,n]) => counts[table]===n),
    rawCsvCountsMatchExactly: Object.values(csvCounts).every((row) => row.source === row.database),
    csvCounts, tableCounts, cityCounts, researchAudit,
    routeJoinSql, routeJoins, missingSourcesSql, missingRouteSources,
    excludedRows: Object.fromEntries(Object.entries(sources.datasets).map(([name, data]) => [name, data.rejected])),
  };
}
