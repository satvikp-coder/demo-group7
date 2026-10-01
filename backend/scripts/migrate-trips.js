import { readFile } from "node:fs/promises";
import { pool } from "../config/database.js";
try {
  await pool.query(await readFile(new URL("../migrations/001-trip-generation.sql", import.meta.url), "utf8"));
  console.log("Trip generation migration applied.");
} finally { await pool.end(); }

