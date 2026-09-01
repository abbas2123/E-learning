import { Schema, model } from "mongoose";

const ResourceSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: "document" },
  },
  { _id: false },
);

const LessonSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sectionId: {
      type: String,
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    type: {
      type: String,
      enum: ["video", "text", "quiz", "assignment"],
      default: "video",
    },
    videoUrl: {
      type: String,
      default: null,
      trim: true,
    },
    videoSourceType: {
      type: String,
      enum: ["uploaded", "youtube", "vimeo", "external", "hls", null],
      default: null,
    },
    quizId: {
      type: String,
      default: null,
      index: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    resources: {
      type: [ResourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

LessonSchema.index({ sectionId: 1, order: 1 });
LessonSchema.index({ quizId: 1 }, { sparse: true });

export const LessonModel = model("Lesson", LessonSchema);
