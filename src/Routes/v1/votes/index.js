import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

// Protected: Cast a vote
router.post(
  "/cast",
  globalRequestValidator(VALIDATORS.CreateVoteSchema),
  authGuard,
  routeGuard("VOTER"),
  V1Controller.VotesController.create,
);

// Protected: Check if user has voted in a poll
router.get(
  "/status/:pollId",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.VotesController.checkVoteStatus,
);

// Public: Get vote statistics for a poll (counts only, no voter details)
router.get("/stats/:pollId", V1Controller.VotesController.getPollStats);

// Admin: Delete a vote
router.delete(
  "/:id",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.VotesController.destroy,
);

export default router;
