import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Polls",
      required: true,
    },

    manifesto: String, // optional (why should they win)
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  }
);

// Enforce 1 candidate per poll per user
candidateSchema.index({ user: 1, poll: 1 }, { unique: true });

export const Candidate = mongoose.model("Candidates", candidateSchema);
