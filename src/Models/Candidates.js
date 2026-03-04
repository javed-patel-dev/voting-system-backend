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
    manifesto: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  },
);

// Enforce: A user can only be a candidate ONCE per poll (but can be candidate in multiple polls)
candidateSchema.index({ userId: 1, pollId: 1 }, { unique: true });

// Index for fast lookup by pollId
candidateSchema.index({ pollId: 1 });

export const Candidate = mongoose.model("candidates", candidateSchema);
