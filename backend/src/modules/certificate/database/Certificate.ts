import { Schema, model } from "mongoose";

const CertificateSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    certificateId: {
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
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    verificationUrl: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["valid", "revoked"],
      default: "valid",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

CertificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
CertificateSchema.index({ studentId: 1 });
CertificateSchema.index({ courseId: 1 });

export const CertificateModel = model("Certificate", CertificateSchema);
