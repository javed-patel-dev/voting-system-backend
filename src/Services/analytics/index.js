// services/VoteService.js
import mongoose from "mongoose";
import { Vote } from "../../Models/Votes.js";

// List winners with filtering and pagination
export const listPollWithCandidate = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const matchStage = {
    ...(filter.search && {
      $or: [
        { "poll.title": { $regex: filter.search, $options: "i" } },
        { "user.name": { $regex: filter.search, $options: "i" } },
      ],
    }),
    ...(filter.pollName && {
      "poll.title": { $regex: filter.pollName, $options: "i" },
    }),
    ...(filter.candidateName && {
      "user.name": { $regex: filter.candidateName, $options: "i" },
    }),
    ...(filter.pollId && {
      "poll._id": new mongoose.Types.ObjectId(filter.pollId),
    }),
  };

  const aggregationPipeline = [
    // Step 1: Group votes by pollId + candidateId
    {
      $group: {
        _id: { pollId: "$pollId", candidateId: "$candidateId" },
        voteCount: { $sum: 1 },
      },
    },

    // Step 2: Lookup candidate document
    {
      $lookup: {
        from: "candidates",
        localField: "_id.candidateId",
        foreignField: "_id",
        as: "candidateDoc",
      },
    },
    { $unwind: "$candidateDoc" },

    // Step 3: Lookup user document for candidate
    {
      $lookup: {
        from: "users",
        localField: "candidateDoc.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              user: {
                _id: "$user._id",
                name: "$user.name",
                email: "$user.email",
              },
            },
          ],
        },
      },
    },

    // Step 4: Lookup poll document
    {
      $lookup: {
        from: "polls",
        localField: "_id.pollId",
        foreignField: "_id",
        as: "poll",
      },
    },
    { $unwind: "$poll" },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              poll: {
                _id: "$poll._id",
                title: "$poll.title",
                description: "$poll.description",
                startDate: "$poll.startDate",
                endDate: "$poll.endDate",
              },
            },
          ],
        },
      },
    },

    // Step 5: Filter by pollName / candidateName / pollId if provided
    {
      $match: matchStage,
    },

    // Step 6: Group by poll, collect candidates array
    {
      $group: {
        _id: "$poll._id",
        poll: { $first: "$poll" },
        candidates: {
          $push: {
            _id: "$candidateDoc._id",
            user: "$user",
            voteCount: "$voteCount",
          },
        },
      },
    },

    // Step 7: Sort candidates array inside each poll
    {
      $addFields: {
        candidates: {
          $slice: [
            { $sortArray: { input: "$candidates", sortBy: sort } },
            limit,
          ],
        },
      },
    },

    // Step 8: Pagination of polls
    { $skip: skip },
    { $limit: limit },

    // Step 9: Final projection
    {
      $project: {
        _id: 0,
        poll: "$poll",
        candidates: "$candidates",
      },
    },
  ];

  const countPipeline = [
    {
      $group: {
        _id: { pollId: "$pollId", candidateId: "$candidateId" },
      },
    },
    {
      $lookup: {
        from: "candidates",
        localField: "_id.candidateId",
        foreignField: "_id",
        as: "candidateDoc",
      },
    },
    { $unwind: "$candidateDoc" },
    {
      $lookup: {
        from: "users",
        localField: "candidateDoc.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "polls",
        localField: "_id.pollId",
        foreignField: "_id",
        as: "poll",
      },
    },
    { $unwind: "$poll" },

    {
      $match: matchStage,
    },

    { $group: { _id: "$poll._id" } }, // Just get unique poll count

    { $count: "count" },
  ];

  const [data, countResult] = await Promise.all([
    Vote.aggregate(aggregationPipeline),
    Vote.aggregate(countPipeline),
  ]);
  const count = countResult[0]?.count || 0;

  return { count, data };
};

export const listCandidatesWithVoters = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const matchStage = {
    ...(filter.search && {
      $or: [
        { "poll.title": { $regex: filter.search, $options: "i" } },
        { "candidateUser.name": { $regex: filter.search, $options: "i" } },
        { "voters.name": { $regex: filter.search, $options: "i" } },
      ],
    }),
    ...(filter.pollName && {
      "poll.title": { $regex: filter.pollName, $options: "i" },
    }),
    ...(filter.candidateName && {
      "candidateUser.name": { $regex: filter.candidateName, $options: "i" },
    }),
    ...(filter.voterName && {
      "voters.name": { $regex: filter.voterName, $options: "i" },
    }),
    ...(filter.pollId && {
      "poll._id": new mongoose.Types.ObjectId(filter.pollId),
    }),
  };

  const aggregationPipeline = [
    // Step 1: Lookup candidate document
    {
      $lookup: {
        from: "candidates",
        localField: "candidateId",
        foreignField: "_id",
        as: "candidateDoc",
      },
    },
    { $unwind: "$candidateDoc" },

    // Step 2: Lookup candidate’s user info
    {
      $lookup: {
        from: "users",
        localField: "candidateDoc.userId",
        foreignField: "_id",
        as: "candidateUser",
      },
    },
    { $unwind: "$candidateUser" },

    // Step 3: Lookup poll
    {
      $lookup: {
        from: "polls",
        localField: "pollId",
        foreignField: "_id",
        as: "poll",
      },
    },
    { $unwind: "$poll" },

    // Step 4: Filter based on search params
    {
      $match: matchStage,
    },

    // Step 5: Group votes per candidate in a poll, collect voter userIds
    {
      $group: {
        _id: { pollId: "$poll._id", candidateId: "$candidateDoc._id" },
        poll: { $first: "$poll" },
        candidateUser: { $first: "$candidateUser" },
        voterIds: { $addToSet: "$voter" }, // Collect voters who voted for this candidate
      },
    },

    // Step 6: Lookup voter user info
    {
      $lookup: {
        from: "users",
        localField: "voterIds",
        foreignField: "_id",
        as: "voters",
      },
    },

    // Step 7: Project only required fields
    {
      $project: {
        _id: 0,
        poll: {
          _id: "$poll._id",
          title: "$poll.title",
          description: "$poll.description",
          startDate: "$poll.startDate",
          endDate: "$poll.endDate",
        },
        candidate: {
          _id: "$candidateUser._id",
          name: "$candidateUser.name",
          email: "$candidateUser.email",
        },
        voters: {
          $map: {
            input: "$voters",
            as: "voter",
            in: {
              _id: "$$voter._id",
              name: "$$voter.name",
              email: "$$voter.email",
            },
          },
        },
      },
    },

    // Step 8: Sort
    { $sort: sort },

    // Step 9: Pagination
    { $skip: skip },
    { $limit: limit },
  ];

  const countPipeline = [
    {
      $lookup: {
        from: "candidates",
        localField: "candidateId",
        foreignField: "_id",
        as: "candidateDoc",
      },
    },
    { $unwind: "$candidateDoc" },
    {
      $lookup: {
        from: "users",
        localField: "candidateDoc.userId",
        foreignField: "_id",
        as: "candidateUser",
      },
    },
    { $unwind: "$candidateUser" },
    {
      $lookup: {
        from: "polls",
        localField: "pollId",
        foreignField: "_id",
        as: "poll",
      },
    },
    { $unwind: "$poll" },

    {
      $match: matchStage,
    },

    {
      $group: {
        _id: { pollId: "$poll._id", candidateId: "$candidateDoc._id" },
      },
    },

    { $count: "count" },
  ];

  const [data, countResult] = await Promise.all([
    Vote.aggregate(aggregationPipeline),
    Vote.aggregate(countPipeline),
  ]);
  const count = countResult[0]?.count || 0;

  return { count, data };
};

export const getDashboardStats = async () => {
  const now = new Date();

  const [
    totalVotersResult,
    totalCandidatesResult,
    totalPollsResult,
    totalVotesResult,
    activePollsResult,
    upcomingPollsResult,
    endedPollsResult,
  ] = await Promise.all([
    // Total Voters (all users with role VOTER - these are potential voters)
    mongoose.connection.db
      .collection("users")
      .countDocuments({ role: "VOTER" }),

    // Total Candidate registrations (across all polls)
    mongoose.connection.db.collection("candidates").countDocuments({}),

    // Total Polls
    mongoose.connection.db.collection("polls").countDocuments({}),

    // Total Votes cast
    mongoose.connection.db.collection("votes").countDocuments({}),

    // Active Polls (current date between startDate and endDate)
    mongoose.connection.db.collection("polls").countDocuments({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),

    // Upcoming Polls
    mongoose.connection.db.collection("polls").countDocuments({
      startDate: { $gt: now },
    }),

    // Ended Polls
    mongoose.connection.db.collection("polls").countDocuments({
      endDate: { $lt: now },
    }),
  ]);

  // Get recent activity (votes in last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivity = await mongoose.connection.db
    .collection("votes")
    .countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
    });

  // Get unique voters (users who have actually voted at least once)
  const uniqueVotersResult = await Vote.aggregate([
    { $group: { _id: "$voter" } },
    { $count: "count" },
  ]);
  const uniqueVoters = uniqueVotersResult[0]?.count || 0;

  // Get trending candidates (top 5 by votes)
  const trendingCandidates = await Vote.aggregate([
    {
      $group: {
        _id: "$candidateId",
        voteCount: { $sum: 1 },
      },
    },
    { $sort: { voteCount: -1 } },
    { $limit: 5 },
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
      $lookup: {
        from: "polls",
        localField: "candidate.pollId",
        foreignField: "_id",
        as: "poll",
      },
    },
    { $unwind: "$poll" },
    {
      $project: {
        _id: 0,
        candidateId: "$_id",
        voteCount: 1,
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
        },
        poll: {
          _id: "$poll._id",
          title: "$poll.title",
        },
      },
    },
  ]);

  // Get polls by activity (most votes)
  const popularPolls = await Vote.aggregate([
    {
      $group: {
        _id: "$pollId",
        voteCount: { $sum: 1 },
      },
    },
    { $sort: { voteCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "polls",
        localField: "_id",
        foreignField: "_id",
        as: "poll",
      },
    },
    { $unwind: "$poll" },
    {
      $project: {
        _id: 0,
        pollId: "$_id",
        voteCount: 1,
        title: "$poll.title",
        startDate: "$poll.startDate",
        endDate: "$poll.endDate",
        status: "$poll.status",
      },
    },
  ]);

  return {
    totalVoters: totalVotersResult,
    uniqueVoters,
    totalCandidates: totalCandidatesResult,
    totalPolls: totalPollsResult,
    activePolls: activePollsResult,
    upcomingPolls: upcomingPollsResult,
    endedPolls: endedPollsResult,
    totalVotes: totalVotesResult,
    recentActivity,
    trendingCandidates,
    popularPolls,
  };
};

// Get detailed voter list per candidate for admin
export const getVotersForCandidate = async (
  pollId,
  candidateId,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const filter = { pollId: new mongoose.Types.ObjectId(pollId) };
  if (candidateId) {
    filter.candidateId = new mongoose.Types.ObjectId(candidateId);
  }

  const [voters, total] = await Promise.all([
    Vote.find(filter)
      .populate("voter", "name email avatar createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vote.countDocuments(filter),
  ]);

  return { voters, total };
};

// Get voting timeline for a poll
export const getVotingTimeline = async (pollId) => {
  const votes = await Vote.aggregate([
    { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        count: 1,
      },
    },
  ]);

  return votes;
};

// Get user voting history
export const getUserVotingHistory = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [votes, total] = await Promise.all([
    Vote.find({ voter: new mongoose.Types.ObjectId(userId) })
      .populate(
        "pollId",
        "title description startDate endDate status isResultDeclared",
      )
      .populate({
        path: "candidateId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vote.countDocuments({ voter: new mongoose.Types.ObjectId(userId) }),
  ]);

  return { votes, total };
};

// Get candidate registrations for a user
export const getUserCandidateHistory = async (userId) => {
  const candidates = await mongoose.connection.db
    .collection("candidates")
    .aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "polls",
          localField: "pollId",
          foreignField: "_id",
          as: "poll",
        },
      },
      { $unwind: "$poll" },
      {
        $lookup: {
          from: "votes",
          let: { candidateId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$candidateId", "$$candidateId"] } } },
            { $count: "count" },
          ],
          as: "voteInfo",
        },
      },
      {
        $project: {
          _id: 1,
          pollId: "$poll._id",
          pollTitle: "$poll.title",
          manifesto: 1,
          voteCount: { $ifNull: [{ $arrayElemAt: ["$voteInfo.count", 0] }, 0] },
          pollStatus: "$poll.status",
          isResultDeclared: "$poll.isResultDeclared",
          winnerId: "$poll.winnerId",
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();

  // Mark if user was winner
  return candidates.map((c) => ({
    ...c,
    isWinner: c.winnerId?.toString() === c._id.toString(),
  }));
};
