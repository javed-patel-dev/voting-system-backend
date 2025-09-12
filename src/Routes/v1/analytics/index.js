import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";

const router = Router();

router.post(
  "/list-winners",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.AnalyticsController.listWinnersOfElectionPerPolls
);


export default router;
