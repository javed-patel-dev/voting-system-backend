import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  }
);

// Index for startDate/endDate queries
pollSchema.index({ startDate: 1, endDate: 1 });

export const Poll = mongoose.model("polls", pollSchema);
