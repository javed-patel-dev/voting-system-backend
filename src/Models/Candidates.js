import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "polls",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  }
);

// Enforce 1 candidate per poll
candidateSchema.index({ userId: 1 }, { unique: true });

export const Candidate = mongoose.model("candidates", candidateSchema);
