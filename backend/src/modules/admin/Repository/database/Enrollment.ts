import { Schema, model } from "mongoose";

const EnrollmentSchema = new Schema(
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
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
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
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Stripe",
    },
    status: {
      type: String,
      enum: ["completed", "refunded", "pending"],
      default: "completed",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = model("Enrollment", EnrollmentSchema);
