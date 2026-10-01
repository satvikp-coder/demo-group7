import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const reportPath = new URL("../reports/frontend-browser-report.json", import.meta.url);
const tables = ["destinations", "attractions", "hotels", "restaurants", "routes"];
async function snapshot() {
  const result = {};
  for (const table of tables) result[table] = (await pool.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
  return JSON.stringify(result);
}
const before = await snapshot();
// Never consume a previous successful report if Python/Chrome fails to launch.
writeFileSync(reportPath, JSON.stringify({ verified: false, users: [], responses: [], checks: [], failure: "Browser run did not complete" }));
let result;
try {
  result = spawnSync("python", ["tests/frontend/browser_api.py"], { cwd: root, stdio: "inherit" });
} finally {
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  // Clean exact test creations even when an assertion interrupted the UI flow.
  for (const resource of ["attractions", "restaurants", "hotels", "destinations"]) {
    for (const response of report.responses) {
      if (response.method === "POST" && response.path === `/admin/${resource}` && response.status === 201) {
        const id = response.body?.id;
        if (id) await pool.query(`DELETE FROM ${resource} WHERE id=$1`, [id]);
      }
    }
  }
  for (const id of report.users) await pool.query("DELETE FROM users WHERE id=$1", [id]);
  report.cleanupCompleted = true;
  report.originalCatalogPreserved = before === await snapshot();
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  await pool.end();
  console.log(JSON.stringify({ verified: report.verified, checks: report.checks.length, cleanupCompleted: report.cleanupCompleted, originalCatalogPreserved: report.originalCatalogPreserved }));
  if (!report.originalCatalogPreserved || !report.verified) process.exitCode = 1;
}
if (result?.status !== 0) process.exitCode = 1;
