import * as Yup from "yup";

export const CreateUserSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Email is invalid.")
    .required("Email is required."),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[0-9]/, "Password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
    .required("Password is required."),
  name: Yup.string().required("Name is required."),
  otp: Yup.string().required("OTP is required."),
});

export const UpdateUserSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[0-9]/, "Password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
    .notRequired(),
  name: Yup.string().notRequired(),
  role: Yup.string().notRequired(),
});
