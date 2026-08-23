import { Schema, model } from "mongoose";

export enum DiscussionStatus {
  OPEN = "open",
  ANSWERED = "answered",
  RESOLVED = "resolved",
  LOCKED = "locked",
}

const DiscussionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      default: null,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(DiscussionStatus),
      default: DiscussionStatus.OPEN,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastReplyAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

DiscussionSchema.index({ courseId: 1, createdAt: -1 });
DiscussionSchema.index({ courseId: 1, lessonId: 1, createdAt: -1 });
DiscussionSchema.index({ studentId: 1, createdAt: -1 });
DiscussionSchema.index({ status: 1, createdAt: -1 });

export const DiscussionModel = model("Discussion", DiscussionSchema);
