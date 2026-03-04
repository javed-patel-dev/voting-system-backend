// services/VoteService.js
import mongoose from "mongoose";
import { Vote } from "../../Models/Votes.js";

// Create a new document
export const create = async (data) => {
  return Vote.create(data);
};

// Find one vote
export const findOne = async (filter) => {
  return Vote.findOne(filter);
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
    Vote.find(filter, projection)
      .populate("voter", "name email")
      .populate("candidateId")
      .populate("pollId", "title")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Vote.countDocuments(filter),
  ]);

  return { data, total };
};

// Get vote counts by candidate for a poll
export const getVoteCountsByCandidate = async (pollId) => {
  const results = await Vote.aggregate([
    { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
    {
      $group: {
        _id: "$candidateId",
        voteCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "candidates",
        localField: "_id",
        foreignField: "_id",
        as: "candidate",
      },
    },
    { $unwind: "$candidate" },
    {
      $lookup: {
        from: "users",
        localField: "candidate.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        candidateId: "$_id",
        voteCount: 1,
        manifesto: "$candidate.manifesto",
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          avatar: "$user.avatar",
        },
      },
    },
    { $sort: { voteCount: -1 } },
  ]);

  // Get total votes for percentage calculation
  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  return {
    totalVotes,
    candidates: results.map((r) => ({
      ...r,
      percentage:
        totalVotes > 0 ? ((r.voteCount / totalVotes) * 100).toFixed(1) : 0,
    })),
  };
};

// Count total votes for a poll
export const countByPoll = async (pollId) => {
  return Vote.countDocuments({ pollId: new mongoose.Types.ObjectId(pollId) });
};

// Count votes for a specific candidate
export const countByCandidate = async (candidateId) => {
  return Vote.countDocuments({
    candidateId: new mongoose.Types.ObjectId(candidateId),
  });
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Vote.deleteOne(filter);
};

// Delete all votes for a poll
export const destroyByPoll = async (pollId) => {
  return Vote.deleteMany({ pollId: new mongoose.Types.ObjectId(pollId) });
};

// Get votes with voter details (admin only)
export const getVotesWithVoterDetails = async (pollId, candidateId = null) => {
  const matchFilter = { pollId: new mongoose.Types.ObjectId(pollId) };
  if (candidateId) {
    matchFilter.candidateId = new mongoose.Types.ObjectId(candidateId);
  }

  return Vote.find(matchFilter)
    .populate("voter", "name email avatar")
    .populate("candidateId")
    .sort({ createdAt: -1 });
};
