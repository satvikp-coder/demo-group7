import { z } from "zod";

export const idParams = z.object({ id: z.string().uuid() }).strict();
export const paginationQuery = z.object({
  limit: z.string().regex(/^[0-9]+$/).pipe(z.coerce.number().int().min(1).max(100)).default(20),
  offset: z.string().regex(/^[0-9]+$/).pipe(z.coerce.number().int().min(0).max(2147483647)).default(0),
}).strict();
export const destinationQuery = paginationQuery.extend({
  destinationId: z.string().uuid(),
});

const email = z.string().trim().toLowerCase().max(255).email();
const password = z.string().min(1).max(72).refine(
  (value) => Buffer.byteLength(value, "utf8") <= 72,
  "Password must not exceed 72 UTF-8 bytes",
);
export const registerBody = z.object({
  name: z.string().trim().min(1).max(255),
  email,
  password: password.min(12)
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9\s]/, "Password must contain a symbol"),
  role: z.enum(["tourist", "tour_operator"]).default("tourist"),
}).strict();

export const loginBody = z.object({ email, password }).strict();

export const destinationParams = z.object({
  id: z.union([
    z.string().uuid(),
    z.string().min(1).max(100).regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  ]),
}).strict();
export const emptyQuery = z.object({}).strict();
export const searchQuery = paginationQuery.extend({
  prefix: z.string().trim().min(1).max(100),
}).strict();
export const hotelQuery = paginationQuery.extend({
  sort: z.enum(["price", "rating", "name", "value"]).default("price"),
}).strict();
