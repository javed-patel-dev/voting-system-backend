// services/PollService.js
import mongoose from "mongoose";
import { Poll } from "../../Models/Polls.js";

// Find one document
export const findOne = async (filter = {}, projection = null, options = {}) => {
  return Poll.findOne(filter, projection, options);
};

// Create a new document
export const create = async (data) => {
  return Poll.create(data);
};

// Update one document
export const updateOne = async (filter, update, options = {}) => {
  return Poll.updateOne(filter, update, options);
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
    Poll.find(filter, projection).sort(sort).skip(skip).limit(limit),
    Poll.countDocuments(filter),
  ]);

  return { data, total };
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Poll.deleteMany(filter); // or deleteOne if single
};

// Get poll with candidates
export const getPollWithCandidates = async (pollId) => {
  return Poll.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(pollId) } },
    {
      $lookup: {
        from: "candidates",
        localField: "_id",
        foreignField: "pollId",
        as: "candidates",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "candidates.userId",
        foreignField: "_id",
        as: "candidateUsers",
      },
    },
    {
      $project: {
        title: 1,
        startDate: 1,
        endDate: 1,
        candidateUsers: {
          $map: {
            input: "$candidateUsers",
            as: "u",
            in: { name: "$$u.name", email: "$$u.email" },
          },
        },
      },
    },
  ]);
};
