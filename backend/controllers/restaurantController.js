import { listByDestination } from "../models/restaurantModel.js";

export async function listRestaurants(req, res) {
  const { limit, offset } = req.validated.query;
  res.json(await listByDestination(req.destination.id, limit, offset));
}
