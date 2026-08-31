import crypto from "crypto";
import { randomUUID } from "crypto";
import type { IPaymentRepository } from "../interface/IPaymentRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { CourseModel } from "../../course/repository/database/Course";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { NotificationModel } from "../../admin/Repository/database/Notification";

export interface VerifyMultiPaymentParams {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

export class VerifyMultiPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(params: VerifyMultiPaymentParams): Promise<{ success: boolean; enrolledCourseIds: string[] }> {
    const { userId, orderId, paymentId, signature } = params;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "totc_razorpay_secret_key";

    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && (!signature || signature === "dummy_sig")) {
      await this.paymentRepository.markAsFailed(orderId, "Missing or invalid Razorpay Signature");
      throw new Error("Razorpay cryptographic payment signature is strictly required in production.");
    }

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

    const pendingPayment = await this.paymentRepository.findByOrderId(orderId);
    if (!pendingPayment) {
      throw new Error("Pending payment order not found.");
    }

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    const studentId = user?.id || userId;
    const studentName = user?.name || "Student";
    const studentEmail = user?.email || userId;

    if (pendingPayment.userId !== studentId && pendingPayment.userId !== userId) {
      throw new Error("Order ownership verification failed.");
    }

    // Mark Payment as PAID in MongoDB
    const payment = await this.paymentRepository.markAsPaid(orderId, paymentId, signature);

    const targetCourseIds = payment.courseIds && payment.courseIds.length > 0
      ? payment.courseIds
      : [payment.courseId];

    const courses = await CourseModel.find({ id: { $in: targetCourseIds } });
    const courseMap = new Map<string, string>();
    for (const c of courses) {
      courseMap.set(c.id, c.title);
    }

    const enrolledCourseIds: string[] = [];

    // Idempotently create enrollment for every purchased course
    for (const courseId of targetCourseIds) {
      const courseTitle = courseMap.get(courseId) || "Course";

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
          amountPaid: Math.round(payment.amount / Math.max(1, targetCourseIds.length)),
          paymentMethod: "Razorpay",
          status: "completed",
        });
      }

      enrolledCourseIds.push(courseId);
    }

    // Persist confirmation notification in MongoDB
    await NotificationModel.create({
      id: `notif-multi-${Date.now()}`,
      title: "Multi-Course Enrollment Confirmed",
      message: `Your payment of ₹${payment.amount} for ${enrolledCourseIds.length} courses was verified successfully.`,
      type: "payment",
      read: false,
    });

    return {
      success: true,
      enrolledCourseIds,
    };
  }
}
