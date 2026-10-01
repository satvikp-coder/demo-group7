import { pool } from "../config/database.js";
import { HttpError } from "../middleware/errorHandler.js";
import { adminSchemas } from "../middleware/adminSchemas.js";

// SQL identifiers come exclusively from the fixed schema allowlist, never URL/body text.
function fieldsFor(resource, body = {}) {
  if (!Object.hasOwn(adminSchemas, resource)) throw new Error("Unsupported admin resource");
  const keys = Object.keys(body);
  if (keys.some(key => !Object.hasOwn(adminSchemas[resource].shape, key))) {
    throw new Error("Unsupported admin field");
  }
  return keys;
}
async function write(sql, values, operation) {
  try {
    const { rows } = await pool.query(sql, values);
    if (!rows[0]) throw new HttpError(404, "Record not found");
    return rows[0];
  } catch (error) {
    if (error.code === "23503") throw new HttpError(operation === "create" ? 422 : 409,
      operation === "create" ? "Referenced destination does not exist" : "Change conflicts with referenced records");
    if (["23514", "23502", "22003", "22007", "22008"].includes(error.code)) {
      throw new HttpError(400, "Invalid catalog data");
    }
    throw error;
  }
}
export async function create(resource, id, body) {
  const fields = fieldsFor(resource, body);
  const columns = ["id", ...fields];
  return write(`INSERT INTO ${resource} (${columns.join(",")}) VALUES (${columns.map((_,i)=>`$${i+1}`).join(",")}) RETURNING *`,
    [id,...fields.map(key=>body[key])], "create");
}
export async function update(resource, id, body) {
  const fields = fieldsFor(resource, body);
  const assignments = fields.map((key,i)=>`${key}=$${i+2}`);
  // An operator edit is not independent verification and no longer matches a seed hash.
  if (resource !== "destinations") assignments.push("provenance_status='unverified'", "source_row_hash=NULL");
  return write(`UPDATE ${resource} SET ${assignments.join(",")} WHERE id=$1 RETURNING *`,
    [id,...fields.map(key=>body[key])], "update");
}
export async function remove(resource, id) {
  fieldsFor(resource);
  return write(`DELETE FROM ${resource} WHERE id=$1 RETURNING *`, [id], "delete");
}
export async function get(resource, id) {
  fieldsFor(resource);
  const { rows } = await pool.query(`SELECT * FROM ${resource} WHERE id=$1`, [id]);
  if (!rows[0]) throw new HttpError(404, "Record not found");
  return rows[0];
}
export async function list(resource, { limit, offset }) {
  fieldsFor(resource);
  return (await pool.query(`SELECT * FROM ${resource} ORDER BY name,id LIMIT $1 OFFSET $2`,[limit,offset])).rows;
}
