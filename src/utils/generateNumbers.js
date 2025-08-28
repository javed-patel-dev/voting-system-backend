import crypto from "crypto";

export const generateOtp = (length = 4) => {
  return crypto
    .randomInt(Math.pow(10, length - 1), Math.pow(10, length))
    .toString();
};
