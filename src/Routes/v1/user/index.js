import { Router } from "express";

import { GlobalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";

const router = Router();

router.post(
  "/list",
  GlobalRequestValidator(VALIDATORS.GlobalFilterSchema),
  V1Controller.UsersController.list
);

router.get(
  "/:id",
  V1Controller.UsersController.getById
);

router.post(
  "/",
  GlobalRequestValidator(VALIDATORS.CreateUserSchema),
  V1Controller.UsersController.create
);

router.post(
  "/:id",
  GlobalRequestValidator(VALIDATORS.UpdateUserSchema),
  V1Controller.UsersController.update
);

router.post(
  "/delete/:id",
  V1Controller.UsersController.destroy
);


export default router;
