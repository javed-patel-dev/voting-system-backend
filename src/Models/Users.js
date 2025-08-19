import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["voter", "candidate", "admin"], // by default voter
      default: "voter",
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  }
);

// Index for fast lookup
userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model("users", userSchema);
