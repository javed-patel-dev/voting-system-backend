import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[0-9]/, "Password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
    .required("Password is required."),
});

export const RegistrationOTPSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Invalid email")
    .required("Email is required"),
});

export const ResetPasswordOTPSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Invalid email")
    .required("Email is required"),
});

export const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[0-9]/, "Password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
    .required("Password is required."),
  otp: Yup.string().required("OTP is required"),
});

export const ResendOTPSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Invalid email")
    .required("Email is required"),
  purpose: Yup.string()
    .oneOf(["REGISTER", "PASSWORD_RESET", "LOGIN"])
    .required("Purpose is required"),
});

export const VerifyOTPSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Invalid email")
    .required("Email is required"),
  purpose: Yup.string()
    .oneOf(["REGISTER", "PASSWORD_RESET", "LOGIN"])
    .required("Purpose is required"),
  otp: Yup.string().required("OTP is required"),
});
