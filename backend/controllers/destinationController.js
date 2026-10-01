import { list, catalog } from "../models/destinationModel.js";
import { destinationSearchCache } from "../services/destinationSearchCache.js";

export async function listDestinations(req, res) {
  const { limit, offset } = req.validated.query;
  res.json(await list(limit, offset));
}

export async function catalogDestinations(req, res) {
  const {limit,offset}=req.validated.query;
  res.json(await catalog(limit,offset));
}

export function getDestination(req, res) {
  res.json(req.destination);
}

export function searchDestinations(req, res) {
  const { prefix, limit, offset } = req.validated.query;
  res.json(destinationSearchCache.search(prefix, { limit, offset }));
}
