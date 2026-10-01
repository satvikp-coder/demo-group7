import { listByDestination } from "../models/hotelModel.js";
import { sortHotels } from "../services/hotelRanking.js";

export async function listHotels(req, res) {
  const { sort, limit, offset } = req.validated.query;
  const hotels = await listByDestination(req.destination.id);
  res.json(sortHotels(hotels, sort).slice(offset, offset + limit));
}
