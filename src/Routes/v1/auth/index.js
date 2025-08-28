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

router.post(
  "/registration/otp",
  globalRequestValidator(VALIDATORS.RegistrationOTPSchema),
  V1Controller.AuthController.sendRegistrationEmail
);

router.post(
  "/resend/otp",
  globalRequestValidator(VALIDATORS.ResendOTPSchema),
  V1Controller.AuthController.resendOTP
);

router.post(
  "/reset/password",
  globalRequestValidator(VALIDATORS.resetPasswordSchema),
  V1Controller.AuthController.resetPassword
);


export default router;
