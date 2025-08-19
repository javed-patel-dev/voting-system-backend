import * as Yup from "yup";

export const CreatePollSchema = Yup.object().shape({
  title: Yup.string().required("Title is required."),
  description: Yup.string().required("Description is required."),
  startDate: Yup.date().required("Start date is required."),
  endDate: Yup.date().required("End date is required."),
});

export const UpdatePollSchema = Yup.object().shape({
  description: Yup.string().notRequired(),
  startDate: Yup.date().notRequired(),
  endDate: Yup.date().notRequired(),
  candidates: Yup.array().of(Yup.string().notRequired()),
});
