import * as trips from "../models/tripModel.js";
import * as budgets from "../models/budgetModel.js";
import { buildPlan } from "../services/tripPlanner.js";

async function snapshot(client, trip) {
  const stops = await trips.stops(client,trip.id);
  const days=Array.from({length:trip.trip_days},(_,i)=>({day_number:i+1,stops:stops.filter(s=>s.day_number===i+1)}));
  return {trip,days,budget:await budgets.forTrip(client,trip)};
}
export async function list(req,res) {
  res.json(await trips.transaction(client=>trips.listOwned(client,req.user.id,req.validated.query),true));
}
export async function create(req,res) {
  const result=await trips.transaction(async client => {
    const trip=await trips.create(client,req.user.id,req.validated.body);
    const hotel=await trips.selectedHotel(client,trip.starting_hotel_id,trip.destination_id);
    const total=Number(hotel.price_per_night)*trip.trip_days;
    return {trip,hotel_over_budget:total>trip.budget,hotel_total:total,hotel_replaced:false};
  });
  res.status(201).json(result);
}
export async function generate(req,res) {
  const result=await trips.transaction(async client => {
    const trip=await trips.ownedTrip(client,req.validated.params.id,req.user.id,true);
    Object.assign(trip,req.validated.body);
    const plan=buildPlan(trip,await trips.resources(client,trip));
    await trips.savePlan(client,trip,plan);
    const persisted=await trips.ownedTrip(client,trip.id,req.user.id);
    const result=await snapshot(client,persisted);
    await budgets.save(client,result.budget);
    return result;
  });
  res.json(result);
}
export async function get(req,res) {
  res.json(await trips.transaction(async client => snapshot(client,await trips.ownedTrip(client,req.validated.params.id,req.user.id)),true));
}
export async function budget(req,res) {
  res.json(await trips.transaction(async client => budgets.forTrip(client,await trips.ownedTrip(client,req.validated.params.id,req.user.id)),true));
}
