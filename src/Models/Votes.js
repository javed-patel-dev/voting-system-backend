import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "candidates",
      required: true,
    },
    poll: {
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

// Enforce: a voter can only vote once per poll
voteSchema.index({ voter: 1, poll: 1 }, { unique: true });

export const Vote = mongoose.model("votes", voteSchema);
