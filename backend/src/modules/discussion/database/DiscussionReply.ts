import { Schema, model } from "mongoose";

const DiscussionReplySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    discussionId: {
      type: String,
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isInstructorReply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

DiscussionReplySchema.index({ discussionId: 1, createdAt: 1 });
DiscussionReplySchema.index({ authorId: 1, createdAt: -1 });

export const DiscussionReplyModel = model("DiscussionReply", DiscussionReplySchema);
