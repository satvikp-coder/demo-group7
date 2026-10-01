import pg from "pg";
import { env } from "./env.js";
import { poolOptions } from "./poolOptions.js";
import { log } from "../services/logger.js";

export const pool = new pg.Pool(poolOptions({...process.env, ...env}));

// pg connects lazily; HTTP liveness does not imply database readiness.
pool.on("error", () => {
  log("database_idle_error", {}, "error");
});

export async function closeDatabase() {
  await pool.end();
}
