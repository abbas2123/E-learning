import { Schema, model } from "mongoose";

const WishlistSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    price: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

WishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const WishlistModel = model("Wishlist", WishlistSchema);
