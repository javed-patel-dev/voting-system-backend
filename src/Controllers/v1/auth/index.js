import { OTPService, UserService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { encrypt } from "../../../utils/encrypt.js";
import { JWTInstance } from "../../../utils/JWT.js";
import { getEmailTemplateName, isEmailDomainAllowed } from "../../../Services/common/index.js";
import { mailer } from "../../../utils/mailer.js";
import { verifyOtp } from "../../../services/otp/index.js";

export const login = async (req, res, next) => {
  try {
    const {
      body: { email, password },
    } = req;

    const user = await UserService.findOne({ email });

    if (!user) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Email not registered with us",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const isMatch = await encrypt.compare(password, user.password);

    if (!isMatch) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Invalid password",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const token = await JWTInstance.generateToken({ id: user._id, email: user.email, name: user.name, role: user.role });

    return res.customResponse(
      StatusCodes.OK,
      { token },
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};

export const sendRegistrationEmail = async (req, res, next) => {
  try {
    const {
      body: { email },
    } = req;

    if (!isEmailDomainAllowed(email)) {
      return next(
        new CustomError(
          StatusCodes.FORBIDDEN,
          "Email domain is not allowed",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const emailExist = await UserService.findOne({ email });
    if (emailExist) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "Email already exists",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const { otp } = await OTPService.createOtp(email, "REGISTER");

    mailer.sendMail({
      to: email,
      subject: "Email Verification - Online Voting System",
      template: getEmailTemplateName("REGISTER"),
      context: {
        email,
        otp,
        year: new Date().getFullYear(),
      },
    });

    return res.customResponse(
      StatusCodes.CREATED,
      "OTP sent successfully",
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "OTP already exists",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
          error
        )
      );
    }

    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};

export const sendResetPasswordEmail = async (req, res, next) => {
  try {
    const {
      body: { email },
    } = req;

    const { otp } = await OTPService.createOtp(email, "PASSWORD_RESET");

    mailer.sendMail({
      to: email,
      subject: "Email Verification - Online Voting System",
      template: getEmailTemplateName("PASSWORD_RESET"),
      context: {
        email,
        otp,
        year: new Date().getFullYear(),
      },
    });

    return res.customResponse(
      StatusCodes.CREATED,
      "OTP sent successfully",
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "OTP already exists",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
          error
        )
      );
    }

    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const {
      body: { email, password, otp },
    } = req;

    const { success, message } = await verifyOtp(email, "PASSWORD_RESET", otp);

    if (!success) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          message || "Invalid OTP",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const hashedPassword = await encrypt.hash(password);
    await UserService.updateOne({ email }, { password: hashedPassword });

    return res.customResponse(
      StatusCodes.OK,
      "Password reset successfully",
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const {
      body: { email, purpose },
    } = req;

    if (!isEmailDomainAllowed(email)) {
      return next(
        new CustomError(
          StatusCodes.FORBIDDEN,
          "Email domain is not allowed",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const otpExists = await OTPService.findOne({ email, purpose });
    if (otpExists) {
      await OTPService.destroy({ _id: otpExists._id });
    }

    const { otp } = await OTPService.createOtp(email, purpose);

    mailer.sendMail({
      to: email,
      subject: "OTP Resend - Online Voting System",
      template: getEmailTemplateName(purpose),
      context: {
        email,
        otp,
        year: new Date().getFullYear(),
      },
    });

    return res.customResponse(
      StatusCodes.OK,
      "OTP resent successfully",
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};

export const verifyOtpApi = async (req, res, next) => {
  try {
    const {
      body: { email, purpose, otp },
    } = req;

    const { success, message } = await verifyOtp(email, purpose, otp);

    if (!success) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          message || "Invalid OTP",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    return res.customResponse(
      StatusCodes.OK,
      "OTP verified successfully",
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};