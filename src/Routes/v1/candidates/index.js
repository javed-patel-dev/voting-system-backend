import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

router.post(
  "/register",
  globalRequestValidator(VALIDATORS.CreateCandidateSchema),
  authGuard,
  routeGuard("VOTER"),
  V1Controller.CandidatesController.create
);

router.post(
  "/list",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.CandidatesController.list
);

router.post(
  "/delete/:id",
  authGuard,
  routeGuard("CANDIDATE"),
  V1Controller.CandidatesController.destroy
);

export default router;
