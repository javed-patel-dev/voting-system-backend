import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

router.post(
  "/cast",
  globalRequestValidator(VALIDATORS.CreateVoteSchema),
  authGuard,
  routeGuard("VOTER"),
  V1Controller.VotesController.create
);

router.post(
  "/delete/:id",
  authGuard,
  routeGuard("VOTER"),
  V1Controller.VotesController.destroy
);

export default router;
