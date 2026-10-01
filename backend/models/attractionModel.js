import { pool } from "../config/database.js";

export async function findById(id) {
  const { rows } = await pool.query(
    "SELECT * FROM attractions WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function listByDestination(destinationId, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    "SELECT * FROM attractions WHERE destination_id = $1 ORDER BY name, id LIMIT $2 OFFSET $3",
    [destinationId, limit, offset],
  );
  return rows;
}
