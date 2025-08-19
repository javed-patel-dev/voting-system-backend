import * as Yup from "yup";

export const CreateUserSchema = Yup.object().shape({
  email: Yup.string().email("Email is invalid.").required("Email is required."),
  password: Yup.string().min(5, "Password must be at least 5 characters long.").required("Password is required."),
  name: Yup.string().required("Name is required."),
});

export const UpdateUserSchema = Yup.object().shape({
  email: Yup.string().email("Email is invalid.").notRequired(),
  password: Yup.string().min(5, "Password must be at least 5 characters long.").notRequired(),
  name: Yup.string().notRequired(),
});
