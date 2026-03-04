import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

// Admin: Get dashboard statistics
router.get(
  "/dashboard-stats",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.AnalyticsController.getDashboardStats,
);

// Public/Protected: List polls with candidate vote counts
router.post(
  "/list-candidate-per-polls-with-votes",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.AnalyticsController.listPollsWithCandidateDetails,
);

// Admin: List candidates with their voters (full details)
router.post(
  "/list-candidate-per-polls-with-voters",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.AnalyticsController.listCandidateWithVoterDetails,
);

// Admin: Get voters for a specific poll (optionally filtered by candidate)
router.get(
  "/poll/:pollId/voters",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.AnalyticsController.getVotersForCandidate,
);

// Admin: Get voters for a specific candidate in a poll
router.get(
  "/poll/:pollId/candidate/:candidateId/voters",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.AnalyticsController.getVotersForCandidate,
);

// Admin: Get voting timeline for a poll
router.get(
  "/poll/:pollId/timeline",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.AnalyticsController.getVotingTimeline,
);

// Protected: Get user's own voting history
router.get(
  "/my-votes",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.AnalyticsController.getUserVotingHistory,
);

// Protected: Get user's candidate history
router.get(
  "/my-candidacies",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.AnalyticsController.getUserCandidateHistory,
);

export default router;
