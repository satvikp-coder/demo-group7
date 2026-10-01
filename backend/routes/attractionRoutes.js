import { Router } from "express";
import { listAttractions } from "../controllers/attractionController.js";
import { validate } from "../middleware/validate.js";
import { destinationParams, paginationQuery } from "../middleware/validationSchemas.js";
import { loadDestination } from "../middleware/loadDestination.js";

const router = Router({ mergeParams: true });
router.get("/", validate(destinationParams, "params"), validate(paginationQuery, "query"), loadDestination, listAttractions);
export default router;
