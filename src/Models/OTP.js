import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["REGISTER", "LOGIN", "PASSWORD_RESET"], // flexible usage
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index, auto deletes after expiry
    },
  },
  { timestamps: true }
);

OTPSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const OTP = mongoose.model("OTP", OTPSchema);
