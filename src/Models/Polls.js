import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidates" }], // populated later
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  }
);

// Index for startDate/endDate queries
pollSchema.index({ startDate: 1, endDate: 1 });

export const Poll = mongoose.model("Polls", pollSchema);
