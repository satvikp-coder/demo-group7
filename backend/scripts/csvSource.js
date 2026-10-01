import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parse } from "csv-parse/sync";
import { z } from "zod";

export const dataDirectory = new URL("../../data/", import.meta.url);
export const headers = {
  "attractions.csv": ["attraction_id", "destination_id", "name", "category", "latitude", "longitude", "entry_fee", "average_visit_duration_hours", "opening_time", "closing_time", "rating", "source"],
  "hotels.csv": ["hotel_id", "destination_id", "hotel_name", "price_per_night", "rating", "stay_type", "latitude", "longitude", "source"],
  "restaurants.csv": ["restaurant_id", "destination_id", "name", "latitude", "longitude", "rating", "avg_cost_per_person", "source"],
  "routes.csv": ["source_attraction_id", "destination_attraction_id", "destination_id", "distance_km", "travel_time_minutes", "source"],
};

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function rowHash(row) {
  return sha256(JSON.stringify(row));
}

export function parseSource(text, filename) {
  const records = parse(text, {
    bom: true, comment: "#", comment_no_infix: true,
    skip_empty_lines: true, trim: true, relax_column_count: true,
  });
  const header = records.shift();
  if (JSON.stringify(header) !== JSON.stringify(headers[filename])) {
    throw new Error("Unexpected CSV header: " + filename);
  }
  return records.map((values, index) => {
    let sourceDate;
    // Known legacy format: routes have one trailing ISO date absent from the header.
    // No general silent truncation of malformed CSV records is allowed.
    if (filename === "routes.csv" && values.length === header.length + 1 &&
        /^\d{4}-\d{2}-\d{2}$/.test(values.at(-1))) {
      sourceDate = values.pop();
    }
    if (values.length !== header.length) {
      throw new Error(filename + ": invalid field count at data row " + (index + 1));
    }
    const row = Object.fromEntries(header.map((field, i) => [field, values[i]]));
    if (sourceDate) row.source_date = sourceDate;
    return row;
  });
}

const number = z.string().trim().min(1).pipe(z.coerce.number().finite());
const nonnegativeInteger = number.pipe(z.number().int().min(0));
const base = z.object({
  destination_id: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/),
  latitude: number.pipe(z.number().min(-90).max(90)),
  longitude: number.pipe(z.number().min(-180).max(180)),
  rating: number.pipe(z.number().min(0).max(5)),
  source: z.string().trim().min(1),
});
const schemas = {
  "attractions.csv": base.extend({
    attraction_id: z.string().regex(/^a\d+$/),
    name: z.string().min(1), category: z.string().min(1), entry_fee: z.string().min(1),
    average_visit_duration_hours: number.pipe(z.number().positive()),
    opening_time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    closing_time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  }).strict(),
  "hotels.csv": base.extend({
    hotel_id: z.string().regex(/^h\d+$/), hotel_name: z.string().min(1),
    price_per_night: nonnegativeInteger,
    stay_type: z.enum(["Toran Hotel", "Heritage Hotel", "Registered Hotel", "Homestay"]),
  }).strict(),
  "restaurants.csv": base.extend({
    restaurant_id: z.string().regex(/^r\d+$/), name: z.string().min(1),
    avg_cost_per_person: nonnegativeInteger,
  }).strict(),
  "routes.csv": z.object({
    source_attraction_id: z.string().regex(/^[ahr]\d+$/),
    destination_attraction_id: z.string().regex(/^[ahr]\d+$/),
    destination_id: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/),
    distance_km: number.pipe(z.number().positive()),
    travel_time_minutes: number.pipe(z.number().int().positive()),
    source: z.string().min(1),
    source_date: z.iso.date().optional(),
  }).strict(),
};

export function syntheticSource(source) {
  return /simulat|synthetic|placeholder|dummy|mock|not collected|not started/i.test(source);
}

export function numericEntryFee(value) {
  if (/^free\b/i.test(value.trim())) return 0;
  // A ferry fare is not an entry fee. Preserve the original text and leave numeric unknown.
  const match = value.trim().match(/^(?:₹|INR\s*|Rs\.?\s*)(\d+(?:\.\d{1,2})?)$/i);
  return match ? Number(match[1]) : null;
}

export async function loadSources(directory = dataDirectory, approvalsUrl = new URL("./seed-approvals.json", import.meta.url)) {
  const approvals = JSON.parse(await readFile(approvalsUrl, "utf8"));
  const datasets = {};
  for (const filename of Object.keys(headers)) {
    const content = await readFile(new URL(filename, directory));
    const rows = parseSource(content.toString("utf8"), filename);
    const approval = approvals.approvedFiles[filename];
    if (approval && (sha256(content) !== approval.sha256 || rows.length !== approval.rows)) {
      throw new Error(filename + " changed since approval; review provenance before seeding");
    }
    const accepted = [];
    const rejected = [];
    const ids = new Set();
    for (const [index, raw] of rows.entries()) {
      const id = raw.attraction_id ?? raw.hotel_id ?? raw.restaurant_id ??
        raw.source_attraction_id + "->" + raw.destination_attraction_id;
      if (ids.has(id)) throw new Error(filename + ": duplicate ID " + id);
      ids.add(id);
      const reason = syntheticSource(raw.source) ? "simulated_or_placeholder_source" :
        !approval ? "no_approved_snapshot" : null;
      if (reason) {
        rejected.push({ row: index + 1, id, reason });
        continue;
      }
      const parsed = schemas[filename].safeParse(raw);
      if (!parsed.success) throw new Error(filename + ": invalid approved row " + id);
      accepted.push({ ...parsed.data, source_row_hash: rowHash(raw) });
    }
    datasets[filename] = { raw: rows, accepted, rejected, sha256: sha256(content) };
  }
  return { verificationBasis: approvals.verificationBasis, datasets };
}
