import { pool } from "../config/database.js";

export async function findById(id) {
  const { rows } = await pool.query(
    "SELECT * FROM hotels WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

// Fetch the complete city set so DSA sorting precedes pagination.
export async function listByDestination(destinationId) {
  const { rows } = await pool.query(
    "SELECT * FROM hotels WHERE destination_id = $1",
    [destinationId],
  );
  return rows;
}

export async function hotelAnchor(slug) {
  if(!slug) return null;
  return (await pool.query('SELECT name,lat,lng FROM attractions WHERE slug=$1',[slug])).rows[0] ?? null;
}
