// services/OTPService.js
import { OTP } from "../../Models/OTP.js";
import { generateOtp } from "../../utils/generateNumbers.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 min

export const findOne = async (filter) => {
  return OTP.findOne(filter);
};

export const create = async (data) => {
  return OTP.create(data);
};

export const destroy = async (filter) => {
  return OTP.deleteMany(filter);
};

export const createOtp = async (email, purpose, otpLength = 4) => {
  const otp = generateOtp(otpLength);

  const otpDoc = await OTP.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  return { otp, otpDoc };
};

export const verifyOtp = async (email, purpose, submittedOtp) => {
  const otpDoc = await OTP.findOne({ email, purpose });

  if (!otpDoc) return { success: false, message: "OTP expired or not found" };
  if (otpDoc.otp !== submittedOtp) return { success: false, message: "Invalid OTP" };

  return { success: true, message: "OTP verified successfully" };
};
