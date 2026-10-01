import { pool } from "../config/database.js";
import { sortHotels } from "../services/hotelRanking.js";

// A single statement gives the existing catalog UI one consistent database snapshot.
// Pagination remains bounded; this avoids one HTTP request per city/child collection.
export async function catalog(limit = 20, offset = 0) {
  const { rows } = await pool.query(`
    SELECT d.*,
      coalesce((SELECT jsonb_agg(to_jsonb(a)-'provenance_review' ORDER BY a.name,a.id) FROM attractions a WHERE a.destination_id=d.id),'[]'::jsonb) AS attractions,
      coalesce((SELECT jsonb_agg(to_jsonb(h)-'provenance_review' ORDER BY h.id) FROM hotels h WHERE h.destination_id=d.id),'[]'::jsonb) AS hotels,
      coalesce((SELECT jsonb_agg(to_jsonb(r)-'provenance_review' ORDER BY r.name,r.id) FROM restaurants r WHERE r.destination_id=d.id),'[]'::jsonb) AS restaurants
    FROM destinations d ORDER BY d.name,d.id LIMIT $1 OFFSET $2`, [limit,offset]);
  return rows.map(row => ({...row,hotels:sortHotels(row.hotels,'price')}));
}

export async function findById(id) {
  const { rows } = await pool.query(
    "SELECT * FROM destinations WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function list(limit = 20, offset = 0) {
  const { rows } = await pool.query(
    "SELECT * FROM destinations ORDER BY name, id LIMIT $1 OFFSET $2",
    [limit, offset],
  );
  return rows;
}

export async function findByIdentifier(identifier) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const { rows } = await pool.query(
    "SELECT * FROM destinations WHERE id = $1::uuid OR slug = $2",
    [isUuid ? identifier : null, isUuid ? null : identifier],
  );
  return rows[0] ?? null;
}

// One consistent DB snapshot supplies both destination records and attraction names.
export async function loadSearchRows() {
  const { rows } = await pool.query(`
    SELECT d.*, coalesce(
      jsonb_agg(jsonb_build_array(a.name, a.gujarati_name, a.hindi_name))
        FILTER (WHERE a.id IS NOT NULL), '[]'::jsonb
    ) AS indexed_attraction_names
    FROM destinations d
    LEFT JOIN attractions a ON a.destination_id = d.id
    GROUP BY d.id
    ORDER BY d.name, d.id
  `);
  return rows;
}
