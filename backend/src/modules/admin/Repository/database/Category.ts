import { Schema, model } from "mongoose";

const CategorySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
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
    },
    iconName: {
      type: String,
      default: "FolderTree",
    },
    color: {
      type: String,
      default: "blue",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const CategoryModel = model("Category", CategorySchema);
