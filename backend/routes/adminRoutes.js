import { Router } from "express";
import { verifyJwt, verifyAccount, requireRoles } from "../middleware/auth.js";
import { status, handlers } from "../controllers/adminController.js";
import { validate } from "../middleware/validate.js";
import { idParams, emptyQuery, paginationQuery } from "../middleware/validationSchemas.js";
import { adminSchemas, updateSchema } from "../middleware/adminSchemas.js";

import { limiter } from "../middleware/production.js";
const mutationLimit = limiter("admin_mutation", 120, 60000, true);

const router = Router({ mergeParams: true });
// Every endpoint added to this router inherits both server-side checks.
router.use(verifyJwt,verifyAccount, requireRoles("tour_operator"));
router.use((req,res,next) => ["POST","PUT","DELETE"].includes(req.method) ? mutationLimit(req,res,next) : next());
router.get("/status", status);
for (const [resource,schema] of Object.entries(adminSchemas)) {
  const controller = handlers(resource);
  const base = `/${resource}`;
  router.get(base, validate(paginationQuery,"query"), controller.list);
  router.get(base+"/:id", validate(idParams,"params"), validate(emptyQuery,"query"), controller.get);
  router.post(base, validate(emptyQuery,"query"), validate(schema), controller.create);
  router.post(base+"/:id", validate(idParams,"params"), validate(emptyQuery,"query"), validate(schema), controller.create);
  router.put(base+"/:id", validate(idParams,"params"), validate(emptyQuery,"query"), validate(updateSchema(schema)), controller.update);
  router.delete(base+"/:id", validate(idParams,"params"), validate(emptyQuery,"query"), controller.remove);
}
export default router;
