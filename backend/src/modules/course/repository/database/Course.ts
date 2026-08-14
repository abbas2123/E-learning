import { Schema, model } from "mongoose";

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

const CourseSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      enum: Object.values(CourseLevel),
      required: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    duration: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
      index: true,
    },

    createdBy: {
      type: String,
      required: true,
      index: true,
    },

    requirements: {
      type: [String],
      default: [],
    },

    learningOutcomes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const CourseModel = model("Course", CourseSchema);
