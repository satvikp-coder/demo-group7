import { writeFileSync } from 'node:fs';
import { pool } from '../config/database.js';
const report = { checkedAt: new Date().toISOString(), cities: [], counts: {} };
try {
  for (const destination of (await pool.query('SELECT * FROM destinations ORDER BY name')).rows) {
    const city = { destination, resources: {} };
    for (const table of ['attractions', 'hotels', 'restaurants', 'routes']) {
      const rows = (await pool.query(`SELECT * FROM ${table} WHERE destination_id=$1 ORDER BY id`, [destination.id])).rows;
      const missing = {};
      for (const row of rows) for (const [key, value] of Object.entries(row)) {
        if (value === null || value === '') missing[key] = (missing[key] || 0) + 1;
      }
      city.resources[table] = { count: rows.length, missing, rows };
    }
    report.cities.push(city);
  }
  for (const table of ['users','trips','itinerary_stops','budgets','destinations','attractions','hotels','restaurants','routes']) {
    report.counts[table] = Number((await pool.query(`SELECT count(*) FROM ${table}`)).rows[0].count);
  }
  writeFileSync(new URL('../reports/final-data-coverage.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ counts: report.counts, cities: report.cities.map(c => ({ name: c.destination.name, slug: c.destination.slug, resources: Object.fromEntries(Object.entries(c.resources).map(([k,v]) => [k, {count:v.count, missing:v.missing}])) })) }, null, 2));
} finally { await pool.end(); }
