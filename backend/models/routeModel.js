import { pool } from "../config/database.js";

export async function listByDestination(destinationId) {
  const { rows } = await pool.query(
    "SELECT source_attraction_id, destination_attraction_id, destination_id, distance_km, travel_time_minutes FROM routes WHERE destination_id = $1 ORDER BY source_attraction_id, destination_attraction_id",
    [destinationId],
  );
  return rows;
}
