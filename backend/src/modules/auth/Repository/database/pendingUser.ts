import { Schema, model } from "mongoose";

const pendingUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    hashedPassword: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-delete expired pending users using MongoDB TTL index
pendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingUserModel = model("PendingUser", pendingUserSchema);
