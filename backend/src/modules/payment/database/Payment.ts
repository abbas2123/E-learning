import { Schema, model } from "mongoose";

export enum PaymentStatus {
  CREATED = "created",
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

const PaymentSchema = new Schema(
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
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      default: "multi",
      index: true,
    },
    courseTitle: {
      type: String,
      default: "Multi-Course Order",
    },
    courseIds: {
      type: [String],
      default: [],
    },
    courseTitles: {
      type: [String],
      default: [],
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
      index: true,
    },
    signature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "Razorpay",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PaymentModel = model("Payment", PaymentSchema);
