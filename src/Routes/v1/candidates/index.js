import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

// Public: List candidates with pagination
router.post(
  "/list",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.CandidatesController.list,
);

// Public: Get candidates for a specific poll
router.get("/poll/:pollId", V1Controller.CandidatesController.listByPoll);

// Protected: Register as a candidate for a poll (only VOTER role can register)
router.post(
  "/register",
  globalRequestValidator(VALIDATORS.CreateCandidateSchema),
  authGuard,
  routeGuard("VOTER"),
  V1Controller.CandidatesController.create,
);

// Protected: Check if current user is a candidate in a poll
router.get(
  "/status/:pollId",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.CandidatesController.checkCandidateStatus,
);

// Protected: Update candidate manifesto
router.put(
  "/:id",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.CandidatesController.update,
);

// Protected: Withdraw candidacy (user withdraws their own)
router.delete(
  "/withdraw/:id",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.CandidatesController.withdraw,
);

// Admin: Delete any candidate
router.delete(
  "/:id",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.CandidatesController.destroy,
);

export default router;
