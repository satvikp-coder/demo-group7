import { Router } from "express";
import { z } from "zod";
import { verifyJwt, verifyAccount } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams, emptyQuery, paginationQuery } from "../middleware/validationSchemas.js";
import * as controller from "../controllers/tripController.js";

import { limiter } from "../middleware/production.js";
import { env } from "../config/env.js";
const generationLimit = limiter("itinerary_generation", env.GENERATION_RATE_LIMIT, 60000, true);
const preferences=z.object({
  strategy:z.enum(["distance-first","budget-first","rating-first"]).optional(),
  wheelchair_accessible_only:z.boolean().optional(),
}).strict();
const createBody=preferences.extend({
  destination_id:z.string().uuid(),days:z.number().int().min(1).max(30),
  budget:z.number().int().min(1).max(10000000),starting_hotel_id:z.string().uuid(),
  start_time:z.string().regex(/^(?:[01][0-9]|2[01]):[0-5][0-9]$/, "Use HH:mm between 00:00 and 21:59"),
  strategy:z.enum(["distance-first","budget-first","rating-first"]).default("distance-first"),
  wheelchair_accessible_only:z.boolean().default(false),
}).strict();
const router=Router();
router.use(verifyJwt,verifyAccount);
router.get('/',validate(paginationQuery,'query'),controller.list);
router.use(validate(emptyQuery,"query"));
router.post("/",validate(createBody),controller.create);
router.post("/:id/generate-itinerary",generationLimit,validate(idParams,"params"),validate(preferences.default({})),controller.generate);
router.get("/:id/budget",validate(idParams,"params"),controller.budget);
router.get("/:id",validate(idParams,"params"),controller.get);
export default router;

