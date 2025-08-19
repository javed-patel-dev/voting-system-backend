import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";

const router = Router();

router.post(
  "/list",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  authGuard,
  V1Controller.UsersController.list
);

router.post(
  "/register",
  globalRequestValidator(VALIDATORS.CreateUserSchema),
  V1Controller.UsersController.create
);

router.post(
  "/:id",
  globalRequestValidator(VALIDATORS.UpdateUserSchema),
  authGuard,
  V1Controller.UsersController.update
);

router.post("/delete/:id", authGuard, V1Controller.UsersController.destroy);

export default router;
