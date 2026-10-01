import { pool } from "../config/database.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function listOwned(client,userId,{limit,offset}) {
  return (await client.query(`SELECT t.id,d.name FROM trips t JOIN destinations d ON d.id=t.destination_id
    WHERE t.user_id=$1 ORDER BY t.created_at DESC,t.id DESC LIMIT $2 OFFSET $3`,[userId,limit,offset])).rows;
}

export async function transaction(work, readOnly = false) {
  // A competing regeneration can commit after this snapshot began, causing
  // SELECT FOR UPDATE to raise 40001. Retry the whole rolled-back snapshot.
  for (let attempt = 0; ; attempt++) {
    const client = await pool.connect();
    try {
      await client.query(readOnly ? "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY" : "BEGIN ISOLATION LEVEL REPEATABLE READ");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      if (readOnly || !["40001", "40P01"].includes(error.code) || attempt >= 4) throw error;
    } finally { client.release(); }
  }
}
export async function ownedTrip(client, id, userId, lock = false) {
  const sql = lock
    ? "SELECT * FROM trips WHERE id = $1 AND user_id = $2 FOR UPDATE"
    : "SELECT * FROM trips WHERE id = $1 AND user_id = $2";
  const { rows } = await client.query(sql, [id, userId]);
  if (!rows[0]) throw new HttpError(404, "Trip not found");
  return rows[0];
}
export async function selectedHotel(client, hotelId, destinationId) {
  const { rows } = await client.query("SELECT * FROM hotels WHERE id = $1 AND destination_id = $2", [hotelId, destinationId]);
  if (!rows[0]) throw new HttpError(422, "Starting hotel must belong to the selected destination");
  if (rows[0].price_per_night === null) throw new HttpError(422, "Starting hotel has no known price");
  return rows[0];
}
export async function create(client, userId, input) {
  const destination = await client.query("SELECT id FROM destinations WHERE id = $1", [input.destination_id]);
  if (!destination.rowCount) throw new HttpError(404, "Destination not found");
  await selectedHotel(client, input.starting_hotel_id, input.destination_id);
  return (await client.query(
    `INSERT INTO trips (user_id,destination_id,trip_days,budget,starting_hotel_id,start_time,strategy,wheelchair_accessible_only)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId,input.destination_id,input.days,input.budget,input.starting_hotel_id,input.start_time,input.strategy,input.wheelchair_accessible_only],
  )).rows[0];
}
export async function resources(client, trip) {
  // One client/snapshot, and no CSV reads or synthetic route fallback.
  const attractions = (await client.query("SELECT * FROM attractions WHERE destination_id = $1 ORDER BY id", [trip.destination_id])).rows;
  const restaurants = (await client.query("SELECT * FROM restaurants WHERE destination_id = $1 ORDER BY avg_cost_per_person, id", [trip.destination_id])).rows;
  const hotel = await selectedHotel(client, trip.starting_hotel_id, trip.destination_id);
  const routes = (await client.query("SELECT * FROM routes WHERE destination_id = $1 ORDER BY distance_km, travel_time_minutes, id", [trip.destination_id])).rows;
  return { attractions, restaurants, hotel, routes };
}
export async function savePlan(client, trip, plan) {
  await client.query("DELETE FROM itinerary_stops WHERE trip_id = $1", [trip.id]);
  for (const s of plan.stops) {
    await client.query(
      `INSERT INTO itinerary_stops
       (trip_id,day_number,stop_order,stop_type,reference_id,name,category,arrival_time,departure_time,duration_minutes,cost,
        lat,lng,wheelchair_accessible,physical_demand,best_time_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [trip.id,s.day_number,s.stop_order,s.stop_type,s.reference_id,s.name,s.category,s.arrival_time,s.departure_time,
       s.duration_minutes,s.cost,s.lat,s.lng,s.wheelchair_accessible,s.physical_demand,s.best_time_note],
    );
  }
  await client.query(
    `UPDATE trips SET strategy=$2,wheelchair_accessible_only=$3,generation_summary=$4,generated_at=CURRENT_TIMESTAMP WHERE id=$1`,
    [trip.id,trip.strategy,trip.wheelchair_accessible_only,JSON.stringify(plan.summary)],
  );
}
export async function stops(client, tripId) {
  return (await client.query("SELECT * FROM itinerary_stops WHERE trip_id=$1 ORDER BY day_number,stop_order", [tripId])).rows;
}
