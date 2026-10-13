import {z} from "zod";
import {pool} from "../config/database.js";
import {hotelPriceView,nearbyHotels,HOTEL_POLICY} from "../../dsa/planning/hotelPolicy.ts";
import {sortHotels} from "../services/hotelRanking.js";
import {ownedTrip} from "../models/tripModel.js";
import {forTrip} from "../models/budgetModel.js";
const destination=z.object({destinationId:z.string().uuid()}).strict();
const schemas={
 search_destinations:z.object({query:z.string().trim().max(60)}).strict(),
 get_attractions:destination,get_restaurants:destination,
 get_hotels:z.object({destinationId:z.string().uuid(),hotelName:z.string().trim().max(80).default(""),tier:z.enum(["Low Cost","Budget","Premium"]).optional(),sortBy:z.enum(["price","rating","distance"]).default("price")}).strict(),
 get_trip:z.object({tripId:z.string().uuid()}).strict(),get_budget:z.object({tripId:z.string().uuid()}).strict(),
 get_app_help:z.object({topic:z.enum(["planning","categories","priorities","saving","deletion","pdf","private_links","costs"])}).strict()
};
export const APP_HELP=Object.freeze({
 planning:"Choose a destination, priced hotel category and property, days/dates, nights, rooms, travelers, budget and priorities. Sign in to generate. Unknown fees/durations can limit visits; unsupported extra days are disclosed, not invented.",
 categories:"INR indicative nightly room-price bands: Low Cost below 1500; Budget 1500 through 4000 inclusive; Premium above 4000. Unknown/historical-only rates cannot be selected as priced stays. Nearby distances are approximate straight-line, not driving.",
 priorities:"Distance/cost/rating integer weights total 100%; default 34/33/33. The bounded deterministic multi-start greedy planner compares feasible sightseeing coverage then normalizes/ranks evaluated alternatives. No global optimum guarantee.",
 saving:"Authenticated generation persists your trip, scheduled stops and known-price snapshots. Profile loads your saved trips from PostgreSQL after refresh.",
 deletion:"Delete Trip asks confirmation and permanently deletes only your owned trip and its stops/budget. Cancel or failed requests retain it.",
 pdf:"Use Download PDF in the generated itinerary. Wait for capture to finish; a failed export is reported.",
 private_links:"Copy private trip link is an owner-authenticated bookmark, not public sharing. Another account cannot access your trip.",
 costs:"Accommodation is nightly room estimate × nights × rooms. Admission may be per person or sourced per vehicle. Known saved-stop subtotals exclude unknown transport fares/taxes. Rates are indicative, not live availability; missing fees are unknown, not free."
});
const trim=value=>typeof value==="string"?value.slice(0,500):value;
function fields(row,keys){return Object.fromEntries(keys.map(key=>[key,trim(row[key]??null)]));}
const basic=["id","name","gujarati_name","hindi_name","description","source_url","source_date"];
export function createToolRunner(database=pool) {
 return async function runTool(name,input,{userId}) {
  if(!Object.hasOwn(schemas,name))return {error:"UNKNOWN_TOOL"};
  const checked=schemas[name].safeParse(input);
  if(!checked.success)return {error:"INVALID_TOOL_ARGUMENTS"};
  const q=checked.data;
  if(!z.string().uuid().safeParse(userId).success)return {error:"UNAUTHORIZED"};
  if(name==="get_app_help")return {topic:q.topic,information:APP_HELP[q.topic]};
  let client;
  try {
   client=await database.connect();
   await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
   await client.query("SET LOCAL statement_timeout = '3000ms'");
   let result;
   if(name==="search_destinations"){
    // Literal substring, not user-controlled wildcards or SQL.
    const query=q.query.replace(/[\\%_]/g,"\\$&");
    const rows=(await client.query("SELECT id,name,gujarati_name,hindi_name,description,slug FROM destinations WHERE name ILIKE $1 ESCAPE '\\' OR gujarati_name ILIKE $1 ESCAPE '\\' OR hindi_name ILIKE $1 ESCAPE '\\' ORDER BY name,id LIMIT 8",["%"+query+"%"])).rows;
    result={destinations:rows.map(r=>fields(r,[...basic,"slug"]))};
    if(!rows.length){
     result.available_destinations=(await client.query("SELECT id,name,gujarati_name,hindi_name FROM destinations ORDER BY name,id LIMIT 8")).rows;
     result.search_note="No exact name match. These are the actual supported names/IDs, not matches. Localized names may be absent. Only use a clearly equivalent requested place (for example a transliteration); otherwise ask for clarification.";
    }
   } else if(name==="get_trip"||name==="get_budget"){
    const trip=await ownedTrip(client,q.tripId,userId);
    if(name==="get_budget"){
     result={...await forTrip(client,trip),currency:"INR",
      interpretation:"Amounts are sums of recorded saved stops. Zero means no recorded charge in that category, not an unknown entry fee or a promise of free services. Total is the known recorded subtotal. Remaining is budget minus this subtotal, before unrecorded costs. Transport fares and taxes may be unknown; never describe this as an all-inclusive cost."};
    }
    else {
     const stops=(await client.query("SELECT day_number,stop_order,name,stop_type,category,arrival_time,departure_time,duration_minutes,cost FROM itinerary_stops WHERE trip_id=$1 ORDER BY day_number,stop_order LIMIT 40",[trip.id])).rows;
     const labels=(await client.query("SELECT d.name AS destination_name,h.name AS hotel_name FROM destinations d LEFT JOIN hotels h ON h.id=$2 WHERE d.id=$1",[trip.destination_id,trip.starting_hotel_id])).rows[0]??{};
     result={destination_name:labels.destination_name??null,hotel_name:labels.hotel_name??null,trip:fields(trip,["id","destination_id","starting_hotel_id","trip_days","lodging_nights","rooms","travelers","start_date","arrival_date","departure_date","budget","weights"]),stops,stop_limit:40,advisories:trip.generation_summary?.day_coverage??null};
    }
   } else {
    const dest=(await client.query("SELECT id,name,slug FROM destinations WHERE id=$1",[q.destinationId])).rows[0];
    if(!dest)result={error:"DESTINATION_NOT_FOUND"};
    else if(name==="get_hotels"){
     const rows=(await client.query("SELECT * FROM hotels WHERE destination_id=$1 AND NOT EXISTS (SELECT 1 FROM unnest($2::text[]) AS term WHERE position(lower(term) in lower(name))=0) ORDER BY name,id LIMIT 100",[q.destinationId,q.hotelName.split(/\s+/).filter(Boolean)])).rows;
     const anchor=(await client.query("SELECT name,lat,lng FROM attractions WHERE destination_id=$1 AND slug=$2 LIMIT 1",[q.destinationId,HOTEL_POLICY.anchors[dest.slug]??null])).rows[0]??null;
     const ranked=sortHotels(nearbyHotels(rows.map(hotelPriceView),anchor,q.tier),q.sortBy);
     result={destination:dest.name,currency:"INR",basis:"Indicative nightly room prices; no live rates/availability. Null price is unavailable.",hotels:ranked.slice(0,8).map(r=>fields(r,[...basic,"location","price_per_night","historical_price_per_night","price_basis","hotel_category","rating","distance_km","distance_type","anchor_name","search_radius_km","expanded_search"])),total_matches:ranked.length};
    } else {
     const table=name==="get_attractions"?"attractions":"restaurants";
     // Table is selected solely from the server allowlist above.
     const rows=(await client.query("SELECT * FROM "+table+" WHERE destination_id=$1 ORDER BY name,id LIMIT 12",[q.destinationId])).rows;
     const keys=name==="get_attractions"?["category","entry_fee","entry_fee_numeric","duration_hours","opening_time","closing_time","wheelchair_accessible"]:["cuisine","avg_cost_per_person","rating","location"];
     result={destination:dest.name,records:rows.map(r=>fields(r,[...basic,...keys])),basis:"Stored source snapshots; null fields are unknown. Opening information may be incomplete."};
    }
   }
   await client.query("COMMIT");
   return result;
  }catch(error){
   if(client)await client.query("ROLLBACK").catch(()=>{});
   return {error:error.status===404?"TRIP_NOT_FOUND":"DATABASE_UNAVAILABLE"};
  }finally{client?.release();}
 };
}
export const runTool=createToolRunner();
