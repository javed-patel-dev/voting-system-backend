import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(5).required("Password is required"),
});

export const RegistrationOTPSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export const resetPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(5).required("Password is required"),
  otp: Yup.string().required("OTP is required"),
});

export const ResendOTPSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  purpose: Yup.string()
    .oneOf(["REGISTER", "PASSWORD_RESET", "LOGIN"])
    .required("Purpose is required"),
});
