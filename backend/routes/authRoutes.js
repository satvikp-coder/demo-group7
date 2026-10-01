import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { verifyJwt, verifyAccount } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerBody, loginBody } from "../middleware/validationSchemas.js";

const router = Router({ mergeParams: true });
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
router.post("/register", validate(registerBody), register);
router.post("/login", validate(loginBody), login);
router.get("/me", verifyJwt, verifyAccount, me);
export default router;
