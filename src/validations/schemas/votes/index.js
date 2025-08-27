import * as Yup from "yup";

export const CreateVoteSchema = Yup.object().shape({
  candidateId: Yup.string().required("Candidate ID is required."),
  pollId: Yup.string().required("Poll ID is required.")
});
