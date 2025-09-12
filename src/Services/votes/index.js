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
export const listWinners = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
  projection = null
) => {
  const skip = (page - 1) * limit;

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
      $match: {
        ...(filter.pollName && {
          "poll.title": { $regex: filter.pollName, $options: "i" },
        }),
        ...(filter.candidateName && {
          "user.name": { $regex: filter.candidateName, $options: "i" },
        }),
        ...(filter.pollId && {
          "poll._id": mongoose.Types.ObjectId(filter.pollId),
        }),
      },
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
      $match: {
        ...(filter.pollName && {
          "poll.name": { $regex: filter.pollName, $options: "i" },
        }),
        ...(filter.candidateName && {
          "user.name": { $regex: filter.candidateName, $options: "i" },
        }),
        ...(filter.pollId && {
          "poll._id": mongoose.Types.ObjectId(filter.pollId),
        }),
      },
    },

    { $group: { _id: "$poll._id" } }, // Just get unique poll count

    { $count: "count" },
  ];

  const [data, countResult] = await Promise.all([
    Vote.aggregate(aggregationPipeline),
    Vote.aggregate(countPipeline)
  ])
  const count = countResult[0]?.count || 0;

  return { count, data };
};
