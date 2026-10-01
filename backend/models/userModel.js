import { pool } from "../config/database.js";

export async function findById(id) {
  const { rows } = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id],
  );
  return rows[0] ?? null;
}

// Internal authentication use only: never serialize password_hash to an API response.
export async function findCredentialsByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  return rows[0] ?? null;
}

// Only the two explicitly supported registration roles may be persisted here.
export async function createUser({ name, email, passwordHash, role }) {
  if (!["tourist", "tour_operator"].includes(role)) throw new Error("Unsupported user role");
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
    [name, email.trim().toLowerCase(), passwordHash, role],
  );
  return rows[0];
}
