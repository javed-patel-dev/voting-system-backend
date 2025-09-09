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
  "/password/reset/otp",
  globalRequestValidator(VALIDATORS.ResetPasswordOTPSchema),
  V1Controller.AuthController.sendResetPasswordEmail
);

router.post(
  "/resend/otp",
  globalRequestValidator(VALIDATORS.ResendOTPSchema),
  V1Controller.AuthController.resendOTP
);

router.post(
  "/reset/password",
  globalRequestValidator(VALIDATORS.ResetPasswordSchema),
  V1Controller.AuthController.resetPassword
);

router.post(
  "/otp/verify",
  globalRequestValidator(VALIDATORS.VerifyOTPSchema),
  V1Controller.AuthController.verifyOtpApi
);

export default router;
