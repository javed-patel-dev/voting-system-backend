import { Router } from "express";

import { globalRequestValidator } from "../../../Middlewares/globalRequestValidator.js";
import { VALIDATORS } from "../../../validations/index.js";
import { V1Controller } from "../../../Controllers/index.js";
import { authGuard } from "../../../Middlewares/authGuard.js";
import { routeGuard } from "../../../Middlewares/routeGuard.js";

const router = Router();

// List users (admin)
router.post(
  "/list",
  globalRequestValidator(VALIDATORS.GlobalFilterSchema),
  authGuard,
  V1Controller.UsersController.list,
);

// Register new user
router.post(
  "/register",
  globalRequestValidator(VALIDATORS.CreateUserSchema),
  V1Controller.UsersController.create,
);

// Get current user's profile
router.get("/profile", authGuard, V1Controller.UsersController.getProfile);

// Update current user's profile
router.put("/profile", authGuard, V1Controller.UsersController.updateProfile);

// Change password
router.put(
  "/change-password",
  authGuard,
  V1Controller.UsersController.changePassword,
);

// Update user by ID (admin)
router.put(
  "/:id",
  globalRequestValidator(VALIDATORS.UpdateUserSchema),
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.UsersController.update,
);

// Delete user (admin)
router.delete(
  "/:id",
  authGuard,
  routeGuard("ADMIN"),
  V1Controller.UsersController.destroy,
);

export default router;
