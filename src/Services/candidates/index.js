// services/CandidateService.js
import { Candidate } from "../../Models/Candidates.js";

// Create a new document
export const create = async (data) => {
  return Candidate.create(data);
};

// Find and count all (pagination + sorting)
export const findAndCountAll = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
  projection = null
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Candidate.find(filter, projection).sort(sort).skip(skip).limit(limit),
    Candidate.countDocuments(filter),
  ]);

  return { data, total };
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Candidate.deleteOne(filter); // or deleteOne if single
};
