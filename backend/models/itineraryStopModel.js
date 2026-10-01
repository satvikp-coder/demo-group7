import { pool } from "../config/database.js";

export async function listByTripForUser(tripId, userId) {
  const { rows } = await pool.query(
    "SELECT s.id, s.trip_id, s.day_number, s.stop_order, s.stop_type, s.reference_id, s.name, s.arrival_time, s.departure_time FROM itinerary_stops s JOIN trips t ON t.id = s.trip_id WHERE s.trip_id = $1 AND t.user_id = $2 ORDER BY s.day_number, s.stop_order",
    [tripId, userId],
  );
  return rows;
}
