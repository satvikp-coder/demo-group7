import jwt from "jsonwebtoken";
import { findById } from "../models/userModel.js";
import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "./errorHandler.js";

const claimsSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(["tourist", "tour_operator"]),
  exp: z.number().int().positive(),
});

export function verifyJwt(req, res, next) {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  if (!match) return next(new HttpError(401, "Bearer token required"));

  try {
    const decoded = jwt.verify(match[1], env.JWT_SECRET, { algorithms: ["HS256"] });
    const claims = claimsSchema.parse(decoded);
    req.user = Object.freeze({ ...claims, id: claims.sub });
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
  return next();
}

export function requireRoles(...roles) {
  if (!roles.length || roles.some((role) => !["tourist", "tour_operator"].includes(role))) {
    throw new Error("Explicit supported roles are required");
  }
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "Access denied"));
    return next();
  };
}

// Re-read the account on protected requests so deletion/demotion revokes old roles.
export async function verifyAccount(req, res, next) {
  const account = await findById(req.user.id);
  if (!account || !["tourist","tour_operator"].includes(account.role)) throw new HttpError(401, "Account no longer available");
  req.user = Object.freeze({...req.user, role: account.role});
  next();
}
