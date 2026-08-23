import { Schema, model } from "mongoose";

// Option stored in DB — visible to students (text only, no correct flag)
const OptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const QuestionSchema = new Schema(
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
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["single_choice", "multiple_choice", "true_false"],
      default: "single_choice",
    },
    // All visible options (text + id)
    options: {
      type: [OptionSchema],
      default: [],
    },
    // NEVER serialised to students — stored server-side only
    correctOptionIds: {
      type: [String],
      required: true,
      select: false,
    },
    // Points awarded for correct answer
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    // Shown only after submission
    explanation: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

QuestionSchema.index({ quizId: 1, order: 1 });
QuestionSchema.index({ quizId: 1, courseId: 1 });

export const QuestionModel = model("Question", QuestionSchema);
