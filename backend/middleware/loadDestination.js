import { findByIdentifier } from "../models/destinationModel.js";
import { HttpError } from "./errorHandler.js";

export async function loadDestination(req, res, next) {
  const destination = await findByIdentifier(req.validated.params.id);
  if (!destination) throw new HttpError(404, "Destination not found");
  req.destination = destination;
  next();
}
