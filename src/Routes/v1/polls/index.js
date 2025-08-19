import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";

const router = Router();

router.post(
  "/list",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.PollsController.list
);

router.get("/:id", authGuard(), V1Controller.PollsController.getDetailById);

router.post(
  "/",
  globalRequestValidator(VALIDATORS.CreateUserSchema),
  V1Controller.PollsController.create
);

router.post(
  "/:id",
  globalRequestValidator(VALIDATORS.UpdateUserSchema),
  authGuard(),
  V1Controller.PollsController.update
);

router.post("/delete/:id", authGuard(), V1Controller.PollsController.destroy);

export default router;
