import { Schema, model } from "mongoose";

const QuizSchema = new Schema(
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
    // Optional: link to a specific lesson of type "quiz"
    lessonId: {
      type: String,
      default: null,
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
    instructions: {
      type: String,
      default: null,
      trim: true,
    },
    // 0 = no time limit
    timeLimitSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Percentage required to pass (0–100)
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    // null = unlimited
    maxAttempts: {
      type: Number,
      default: null,
      min: 1,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

QuizSchema.index({ courseId: 1, isPublished: 1 });
QuizSchema.index({ lessonId: 1 }, { sparse: true });

export const QuizModel = model("Quiz", QuizSchema);
