import * as Yup from "yup";

export const CreateCandidateSchema = Yup.object().shape({
  pollId: Yup.string().required("Poll ID is required."),
});
