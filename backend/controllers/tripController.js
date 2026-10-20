import {mapRouter} from "../services/mapRouting.js";
import {HttpError} from "../middleware/errorHandler.js";
import {lodgingSubtotal} from '../../dsa/planning/accommodation.ts';
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
    const hotel=await trips.selectedHotel(client,trip.starting_hotel_id,trip.destination_id,trip.lodging_nights??trip.trip_days,trip.travelers??1,trip.rooms??1);
    const total=lodgingSubtotal(hotel.price_per_night,trip.lodging_nights??trip.trip_days,trip.rooms??1);
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

export async function remove(req,res) {
  await trips.transaction(client=>trips.removeOwned(client,req.validated.params.id,req.user.id));
  res.status(204).end();
}

export async function map(req,res) {
  const {id,day}=req.validated.params;
  const stops=await trips.transaction(async client=>{
    const trip=await trips.ownedTrip(client,id,req.user.id);
    if(day>trip.trip_days)throw new HttpError(404,'Trip day not found');
    return (await trips.stops(client,id)).filter(s=>s.day_number===day);
  },true);
  const abort=new AbortController();const close=()=>abort.abort();res.on('close',close);
  try {const result=await mapRouter.day(stops,abort.signal);if(!abort.signal.aborted)res.json({trip_id:id,day_number:day,...result});}
  finally {res.off('close',close);}
}
