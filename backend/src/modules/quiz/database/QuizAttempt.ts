import { Schema, model } from "mongoose";

const AnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedOptionIds: { type: [String], default: [] },
  },
  { _id: false },
);

const QuizAttemptSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quizId: {
      type: String,
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// A student can only have ONE in-progress attempt per quiz at a time
QuizAttemptSchema.index(
  { studentId: 1, quizId: 1, status: 1 },
);
QuizAttemptSchema.index({ studentId: 1, courseId: 1 });
QuizAttemptSchema.index({ studentId: 1, quizId: 1 });
QuizAttemptSchema.index({ quizId: 1 });

export const QuizAttemptModel = model("QuizAttempt", QuizAttemptSchema);
