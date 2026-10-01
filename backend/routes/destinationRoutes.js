import { Router } from "express";
import { listDestinations, searchDestinations, getDestination, catalogDestinations } from "../controllers/destinationController.js";
import { validate } from "../middleware/validate.js";
import { destinationParams, emptyQuery, paginationQuery, searchQuery } from "../middleware/validationSchemas.js";
import { loadDestination } from "../middleware/loadDestination.js";
import attractionRoutes from "./attractionRoutes.js";
import hotelRoutes from "./hotelRoutes.js";
import restaurantRoutes from "./restaurantRoutes.js";

const router = Router({ mergeParams: true });
router.get("/", validate(paginationQuery, "query"), listDestinations);
router.get("/catalog", validate(paginationQuery, "query"), catalogDestinations);
// Literal search route must precede /:id.
router.get("/search", validate(searchQuery, "query"), searchDestinations);
router.use("/:id/attractions", attractionRoutes);
router.use("/:id/hotels", hotelRoutes);
router.use("/:id/restaurants", restaurantRoutes);
router.get("/:id", validate(destinationParams, "params"), validate(emptyQuery, "query"), loadDestination, getDestination);
export default router;
