import * as Yup from "yup";

export const QueriesSchema = Yup.object().shape({
  query: Yup.string().required("Query is required."),
});

export const OpenQueriesSchema = Yup.object().shape({
  email: Yup.string().email("Email is invalid.").required("Email is required."),
  country_code: Yup.string().required("Country code is required."),
  phone_number: Yup.string().required("Phone Number is required."),
  first_name: Yup.string().required("First Name is required."),
  last_name: Yup.string().required("Last Name is required."),
  query: Yup.string().required("Query is required."),
});
