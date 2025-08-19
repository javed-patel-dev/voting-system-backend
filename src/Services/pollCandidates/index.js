import { PollCandidate } from "../../Models/PollCandidates.js";

// Create a new document
export const create = async (data) => {
  return PollCandidate.create(data);
};

// Delete (destroy)
export const destroy = async (filter) => {
  return PollCandidate.deleteMany(filter); // or deleteOne if single
};
