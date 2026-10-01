import { Router } from "express";
import { listRestaurants } from "../controllers/restaurantController.js";
import { validate } from "../middleware/validate.js";
import { destinationParams, paginationQuery } from "../middleware/validationSchemas.js";
import { loadDestination } from "../middleware/loadDestination.js";

const router = Router({ mergeParams: true });
router.get("/", validate(destinationParams, "params"), validate(paginationQuery, "query"), loadDestination, listRestaurants);
export default router;
