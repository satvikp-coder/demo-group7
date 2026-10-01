import { Router } from "express";
import { listHotels } from "../controllers/hotelController.js";
import { validate } from "../middleware/validate.js";
import { destinationParams, hotelQuery } from "../middleware/validationSchemas.js";
import { loadDestination } from "../middleware/loadDestination.js";

const router = Router({ mergeParams: true });
router.get("/", validate(destinationParams, "params"), validate(hotelQuery, "query"), loadDestination, listHotels);
export default router;
