import { nearbyHotels, HOTEL_POLICY } from '../../dsa/planning/hotelPolicy.ts';
import { listByDestination, hotelAnchor } from "../models/hotelModel.js";
import { sortHotels } from "../services/hotelRanking.js";

export async function listHotels(req, res) {
  const { sort, limit, offset, category } = req.validated.query;
  const hotels = await listByDestination(req.destination.id);
  const anchor=await hotelAnchor(HOTEL_POLICY.anchors[req.destination.slug]);
  res.json(sortHotels(nearbyHotels(hotels,anchor,category), sort).slice(offset, offset + limit));
}
