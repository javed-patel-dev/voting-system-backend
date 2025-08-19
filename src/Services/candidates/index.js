// services/CandidateService.js
import { Candidate } from "../../Models/Candidates.js";

// Create a new document
export const create = async (data) => {
  return Candidate.create(data);
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Candidate.deleteMany(filter); // or deleteOne if single
};
