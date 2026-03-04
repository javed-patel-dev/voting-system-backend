import * as Yup from "yup";

export const CreateCandidateSchema = Yup.object().shape({
  pollId: Yup.string().required("Poll ID is required."),
  manifesto: Yup.string()
    .required("Manifesto is required.")
    .min(10, "Manifesto must be at least 10 characters.")
    .max(2000, "Manifesto cannot exceed 2000 characters."),
});

export const UpdateCandidateSchema = Yup.object().shape({
  manifesto: Yup.string()
    .required("Manifesto is required.")
    .min(10, "Manifesto must be at least 10 characters.")
    .max(2000, "Manifesto cannot exceed 2000 characters."),
});
