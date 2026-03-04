// services/CandidateService.js
import mongoose from "mongoose";
import { Candidate } from "../../Models/Candidates.js";

// Create a new document
export const create = async (data) => {
  return Candidate.create(data);
};

// findOne
export const findOne = async (filter) => {
  return Candidate.findOne(filter);
};

// updateOne
export const updateOne = async (filter, update, options = {}) => {
  return Candidate.updateOne(filter, update, options);
};

// Find and count all (pagination + sorting)
export const findAndCountAll = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
  projection = null,
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Candidate.find(filter, projection)
      .populate("userId", "name email avatar")
      .populate("pollId", "title description startDate endDate status")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Candidate.countDocuments(filter),
  ]);

  return { data, total };
};

// Find candidates by poll with user details
export const findByPollWithUser = async (pollId) => {
  return Candidate.find({ pollId: new mongoose.Types.ObjectId(pollId) })
    .populate("userId", "name email avatar")
    .sort({ createdAt: 1 });
};

// Count candidates for a poll
export const countByPoll = async (pollId) => {
  return Candidate.countDocuments({
    pollId: new mongoose.Types.ObjectId(pollId),
  });
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Candidate.deleteOne(filter);
};

// Delete all candidates for a poll
export const destroyByPoll = async (pollId) => {
  return Candidate.deleteMany({ pollId: new mongoose.Types.ObjectId(pollId) });
};
