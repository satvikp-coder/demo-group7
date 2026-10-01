import { listByDestination } from "../models/attractionModel.js";

export async function listAttractions(req, res) {
  const { limit, offset } = req.validated.query;
  res.json(await listByDestination(req.destination.id, limit, offset));
}
