// services/VoteService.js
import { Vote } from "../../Models/Votes.js";

// Create a new document
export const create = async (data) => {
  return Vote.create(data);
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Vote.deleteMany(filter); // or deleteOne if single
};

// List winners with filtering and pagination
export const listPollWithCandidate = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10
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
      "poll._id": mongoose.Types.ObjectId(filter.pollId),
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
  limit = 10
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
      "poll._id": mongoose.Types.ObjectId(filter.pollId),
    }),
    ...(filter.candidateId && {
      "candidateUser._id": mongoose.Types.ObjectId(filter.candidateId),
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
