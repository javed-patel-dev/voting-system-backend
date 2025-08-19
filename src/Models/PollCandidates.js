import mongoose from "mongoose";

const PollCandidateSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "polls",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  }
);

PollCandidateSchema.index({ pollId: 1, userId: 1 }, { unique: true });

export const PollCandidate = mongoose.model(
  "pollcandidates",
  PollCandidateSchema
);
