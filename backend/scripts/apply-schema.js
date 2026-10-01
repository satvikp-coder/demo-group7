import { readFile } from "node:fs/promises";
import { createPool } from "./database.js";

const pool = createPool();
try {
  // This trusted repository DDL is not built from request/user strings.
  await pool.query(await readFile(new URL("../../database/schema/schema.sql", import.meta.url), "utf8"));
  console.log("Schema applied successfully.");
} catch (error) {
  console.error("Schema application failed; SQLSTATE: " + (error.code ?? "unavailable"));
  process.exitCode = 1;
} finally {
  await pool.end();
}
