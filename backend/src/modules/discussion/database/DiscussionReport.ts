import { Schema, model } from "mongoose";

export enum ReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  DISMISSED = "dismissed",
  ACTION_TAKEN = "action_taken",
}

const DiscussionReportSchema = new Schema(
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
    replyId: {
      type: String,
      default: null,
      index: true,
    },
    reportedBy: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

DiscussionReportSchema.index(
  { reportedBy: 1, discussionId: 1, replyId: 1 },
  { unique: true },
);

export const DiscussionReportModel = model("DiscussionReport", DiscussionReportSchema);
