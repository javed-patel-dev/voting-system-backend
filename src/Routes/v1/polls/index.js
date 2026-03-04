import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

// Public: List polls with pagination
router.post(
  "/list",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.PollsController.list,
);

// Protected: Get poll detail by ID
router.get(
  "/:id",
  authGuard,
  routeGuard(["VOTER", "ADMIN"]),
  V1Controller.PollsController.getDetailById,
);

// Public: Get full poll details with candidates and results
router.get("/:id/full", V1Controller.PollsController.getFullPollDetails);

// Admin: Create a new poll
router.post(
  "/",
  globalRequestValidator(VALIDATORS.CreatePollSchema),
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.PollsController.create,
);

// Admin: Update a poll
router.put(
  "/:id",
  globalRequestValidator(VALIDATORS.UpdatePollSchema),
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.PollsController.update,
);

// Admin: Declare poll results
router.post(
  "/:id/declare-results",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.PollsController.declareResults,
);

// Admin: Delete a poll
router.delete(
  "/:id",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.PollsController.destroy,
);

export default router;
