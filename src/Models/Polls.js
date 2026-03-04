import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Poll status: computed based on dates, but can be manually set for special cases
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "ENDED"],
      default: "UPCOMING",
    },
    // Result declaration tracking
    isResultDeclared: {
      type: Boolean,
      default: false,
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "candidates",
      default: null,
    },
    declaredAt: {
      type: Date,
      default: null,
    },
    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  },
);

// Index for startDate/endDate queries
pollSchema.index({ startDate: 1, endDate: 1 });

// Index for status queries
pollSchema.index({ status: 1 });

// Virtual to compute status based on dates (for real-time accuracy)
pollSchema.methods.computeStatus = function () {
  const now = new Date();
  if (now < this.startDate) return "UPCOMING";
  if (now >= this.startDate && now <= this.endDate) return "ACTIVE";
  return "ENDED";
};

export const Poll = mongoose.model("polls", pollSchema);
