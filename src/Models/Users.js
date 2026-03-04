import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    // Role: Only VOTER or ADMIN. Candidate status is poll-contextual (stored in Candidates collection)
    role: {
      type: String,
      enum: ["VOTER", "ADMIN"],
      default: "VOTER",
    },
    // Profile fields
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // removes __v
  },
);

// Index for fast lookup
userSchema.index({ email: 1 }, { unique: true });

// Index for role-based queries
userSchema.index({ role: 1 });

export const User = mongoose.model("users", userSchema);
