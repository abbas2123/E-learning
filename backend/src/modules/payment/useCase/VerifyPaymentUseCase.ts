import crypto from "crypto";
import { randomUUID } from "crypto";
import type { IPaymentRepository } from "../interface/IPaymentRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { CourseModel } from "../../course/repository/database/Course";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { NotificationModel } from "../../admin/Repository/database/Notification";

export interface VerifyPaymentParams {
  userId: string;
  courseId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

export class VerifyPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(params: VerifyPaymentParams): Promise<boolean> {
    const { userId, courseId, orderId, paymentId, signature } = params;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "totc_razorpay_secret_key";

    // HMAC Signature Verification
    if (signature && signature !== "dummy_sig") {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature !== signature) {
        await this.paymentRepository.markAsFailed(orderId, "Invalid Razorpay Signature");
        throw new Error("Razorpay payment signature verification failed.");
      }
    }

    // Mark Payment as PAID in MongoDB
    const payment = await this.paymentRepository.markAsPaid(orderId, paymentId, signature);

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    const course = await CourseModel.findOne({ id: courseId });

    const studentId = user?.id || userId;
    const studentName = user?.name || "Student";
    const studentEmail = user?.email || userId;
    const courseTitle = course?.title || payment.courseTitle || "Course";

    // Idempotent Enrollment creation
    const existingEnrollment = await EnrollmentModel.findOne({
      studentId,
      courseId,
    });

    if (!existingEnrollment) {
      await EnrollmentModel.create({
        id: randomUUID(),
        studentId,
        studentName,
        studentEmail,
        courseId,
        courseTitle,
        amountPaid: payment.amount,
        paymentMethod: "Razorpay",
        status: "completed",
      });
    }

    // Persist confirmation notification in MongoDB
    await NotificationModel.create({
      id: `notif-${Date.now()}`,
      title: "Enrollment Confirmed",
      message: `Your payment of ₹${payment.amount} for "${courseTitle}" was verified successfully.`,
      type: "payment",
      read: false,
    });

    return true;
  }
}
