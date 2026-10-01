import { z } from "zod";

const text = (max = 10000) => z.string().trim().min(1).max(max);
const optionalText = (max) => text(max).nullable().optional();
const money = z.number().min(0).max(99999999.99).multipleOf(0.01);
const integerPrice = z.number().int().min(0).max(2147483647);
const rating = z.number().min(0).max(5).multipleOf(0.1).nullable().optional();
const slug = text(100).regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
const time = z.string().regex(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).nullable().optional();
const translations = {
  gujarati_name: optionalText(), hindi_name: optionalText(),
  gujarati_description: optionalText(), hindi_description: optionalText(),
};
const provenance = {
  source: optionalText(), source_url: z.string().url().max(2048).nullable().optional(),
  source_date: z.iso.date().nullable().optional(),
};
const entity = {
  destination_id: z.string().uuid(), name: text(255),
  lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  external_id: optionalText(100), slug: slug.nullable().optional(), rating,
  ...translations, ...provenance,
};
export const adminSchemas = Object.freeze({
  destinations: z.object({
    name: text(100), slug, district: optionalText(100), category: optionalText(100),
    location: optionalText(), official_category: optionalText(), tag: optionalText(), rating,
    entry_fee: optionalText(), entry_fee_numeric: money.nullable().optional(),
    best_time: optionalText(), distance_from_ahmedabad: optionalText(),
    distance_numeric: money.nullable().optional(), duration: optionalText(),
    avg_visit_time: optionalText(), image_url: optionalText(2048), image_alt: optionalText(),
    description: optionalText(), highlights: z.array(text()).max(100).nullable().optional(),
    ...translations, seasonal_note: optionalText(), seasonal_gujarati_note: optionalText(),
    seasonal_hindi_note: optionalText(),
    seasonal_active_months: z.array(z.number().int().min(1).max(12)).max(12).nullable().optional(),
    seasonal_peak_window_label: optionalText(), nearest_hospital: optionalText(), nearest_police_station: optionalText(),
  }).strict(),
  attractions: z.object({
    ...entity, duration_hours: z.number().positive().max(999.99).multipleOf(0.01),
    category: text(100), entry_fee: optionalText(), entry_fee_numeric: money.nullable().optional(),
    opening_time: time, closing_time: time, wheelchair_accessible: z.boolean().nullable().optional(),
    physical_demand: z.enum(["low","moderate","high"]).nullable().optional(),
    best_time_note: optionalText(), transport_mode: z.enum(["road","boat","other"]).nullable().optional(),
    image_url: optionalText(2048), image_alt: optionalText(), description: optionalText(),
  }).strict(),
  hotels: z.object({
    ...entity, price_per_night: integerPrice,
    stay_type: z.enum(["Toran Hotel","Heritage Hotel","Registered Hotel","Homestay"]),
    tier: z.enum(["Budget","Mid-range","Luxury"]).nullable().optional(),
    location: optionalText(), description: optionalText(),
    value_score: z.number().min(-9999.99).max(9999.99).multipleOf(0.01).nullable().optional(),
    image_url: optionalText(2048),
  }).strict(),
  restaurants: z.object({
    ...entity, avg_cost_per_person: integerPrice, location: optionalText(), cuisine: optionalText(),
  }).strict(),
});

export function updateSchema(schema) {
  return schema.partial().refine(body => Object.keys(body).length > 0, "At least one editable field is required");
}
