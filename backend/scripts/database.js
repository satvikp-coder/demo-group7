import dotenv from "dotenv";
import pg from "pg";
import { poolOptions } from "../config/poolOptions.js";

dotenv.config({ path: new URL("../.env", import.meta.url), quiet: true });
export function createPool() {
  const value = process.env.DATABASE_URL;
  if (!value || !URL.canParse(value) || !["postgres:", "postgresql:"].includes(new URL(value).protocol)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }
  const pool = new pg.Pool(poolOptions(process.env, 2));
  pool.on("error", () => console.error("Database maintenance connection interrupted"));
  return pool;
}
