import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";

const router = Router();

router.post(
  "/login",
  globalRequestValidator(VALIDATORS.LoginSchema),
  V1Controller.AuthController.login
);


export default router;
