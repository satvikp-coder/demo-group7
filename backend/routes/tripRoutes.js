import {accommodationNights} from '../../dsa/planning/accommodation.ts';
import {validWeights} from '../../dsa/planning/priorities.ts';
import { Router } from "express";
import { z } from "zod";
import { verifyJwt, verifyAccount } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams, emptyQuery, paginationQuery } from "../middleware/validationSchemas.js";
import * as controller from "../controllers/tripController.js";

import { limiter } from "../middleware/production.js";
import { env } from "../config/env.js";
const generationLimit = limiter("itinerary_generation", env.GENERATION_RATE_LIMIT, 60000, true);
const weightSchema=z.object({distance:z.number().int().min(0).max(100),cost:z.number().int().min(0).max(100),rating:z.number().int().min(0).max(100)}).strict().refine(validWeights,"Priorities must total exactly 100");
const preferences=z.object({
  weights:weightSchema.optional(),
  strategy:z.enum(["distance-first","budget-first","rating-first"]).optional(),
  wheelchair_accessible_only:z.boolean().optional(),
}).strict();
const createBody=preferences.extend({
  travelers:z.number().int().min(1).max(20).default(1),
  rooms:z.number().int().min(1).max(20).default(1),
  lodging_nights:z.number().int().min(0).max(31).optional(),
  arrival_date:z.string().date().optional(),
  departure_date:z.string().date().optional(),
  start_date:z.string().date().optional(),
  hotel_category:z.enum(["Low Cost","Budget","Premium"]).optional(),
  destination_id:z.string().uuid(),days:z.number().int().min(1).max(30),
  budget:z.number().int().min(1).max(10000000),starting_hotel_id:z.string().uuid(),
  start_time:z.string().regex(/^(?:[01][0-9]|2[01]):[0-5][0-9]$/, "Use HH:mm between 00:00 and 21:59"),
  strategy:z.enum(["distance-first","budget-first","rating-first"]).default("distance-first"),
  wheelchair_accessible_only:z.boolean().default(false),
}).strict().superRefine((input,ctx)=>{try{accommodationNights(input);}catch(error){ctx.addIssue({code:"custom",message:error.message,path:["lodging_nights"]});}});
const router=Router();
router.use(verifyJwt,verifyAccount);
router.get('/',validate(paginationQuery,'query'),controller.list);
router.use(validate(emptyQuery,"query"));
router.post("/",validate(createBody),controller.create);
router.post("/:id/generate-itinerary",generationLimit,validate(idParams,"params"),validate(preferences.default({})),controller.generate);
router.get("/:id/map/:day",limiter("map_routes",30,60000,true),validate(z.object({id:z.string().uuid(),day:z.coerce.number().int().min(1).max(30)}),"params"),controller.map);
router.get("/:id/budget",validate(idParams,"params"),controller.budget);
router.get("/:id",validate(idParams,"params"),controller.get);
router.delete("/:id",validate(idParams,"params"),validate(z.object({}).strict().default({})),controller.remove);
export default router;

