import { HttpError } from "../middleware/errorHandler.js";

// Explicit scaffold boundary: never return fabricated resource data or auth success.
export function notImplemented(req, res, next) {
  next(new HttpError(501, "Budget endpoints are not implemented yet"));
}
