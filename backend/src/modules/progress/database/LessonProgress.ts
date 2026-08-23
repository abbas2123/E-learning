import { Schema, model } from "mongoose";

const LessonProgressSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Prevent duplicate progress records per student, course, and lesson
LessonProgressSchema.index(
  { studentId: 1, courseId: 1, lessonId: 1 },
  { unique: true },
);
LessonProgressSchema.index({ studentId: 1, courseId: 1 });
LessonProgressSchema.index({ studentId: 1, lessonId: 1 });
LessonProgressSchema.index({ courseId: 1, lessonId: 1 });

export const LessonProgressModel = model(
  "LessonProgress",
  LessonProgressSchema,
);
