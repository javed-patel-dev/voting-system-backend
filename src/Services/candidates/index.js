// services/CandidateService.js
import { Candidate } from "../../Models/Candidates.js";

// Find one document
export const findOne = async (filter = {}, projection = null, options = {}) => {
  return Candidate.findOne(filter, projection, options);
};

// Create a new document
export const create = async (data) => {
  return Candidate.create(data);
};

// Update one document
export const updateOne = async (filter, update, options = {}) => {
  return Candidate.updateOne(filter, update, options);
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

  const [results, total] = await Promise.all([
    Candidate.find(filter, projection).sort(sort).skip(skip).limit(limit),
    Candidate.countDocuments(filter),
  ]);

  return { results, total };
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Candidate.deleteMany(filter); // or deleteOne if single
};
