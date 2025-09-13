import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

router.post(
  "/list-candidate-per-polls-with-votes",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.AnalyticsController.listPollsWithCandidateDetails
);

router.post(
  "/list-candidate-per-polls-with-voters",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.AnalyticsController.listCandidateWithVoterDetails
);

export default router;
