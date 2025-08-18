import { Router } from "express";

import { GlobalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";

const router = Router();

router.post(
  "/list",
  GlobalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.UsersController.listUsers
);


export default router;
