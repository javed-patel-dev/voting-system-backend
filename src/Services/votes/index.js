// services/VoteService.js
import { Vote } from "../../Models/Votes.js";

// Find one document
export const findOne = async (filter = {}, projection = null, options = {}) => {
  return Vote.findOne(filter, projection, options);
};

// Create a new document
export const create = async (data) => {
  return Vote.create(data);
};

// Update one document
export const updateOne = async (filter, update, options = {}) => {
  return Vote.updateOne(filter, update, options);
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
    Vote.find(filter, projection).sort(sort).skip(skip).limit(limit),
    Vote.countDocuments(filter),
  ]);

  return { results, total };
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Vote.deleteMany(filter); // or deleteOne if single
};
