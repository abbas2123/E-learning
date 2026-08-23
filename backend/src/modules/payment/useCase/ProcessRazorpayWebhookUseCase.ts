import crypto from "crypto";
import { PaymentModel, PaymentStatus } from "../database/Payment";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { CourseModel } from "../../course/repository/database/Course";
import { UserModel } from "../../auth/Repository/database/User";
import { Logger } from "../../../core/logger/Logger";

export interface WebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
}

export class ProcessRazorpayWebhookUseCase {
  async execute(rawBody: string, signature: string): Promise<{ success: boolean; message: string }> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      Logger.error("RAZORPAY_WEBHOOK_SECRET is not configured in backend environment.");
      throw new Error("Webhook secret configuration missing.");
    }

    // 1. Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      Logger.warn("Razorpay webhook HMAC signature verification failed.", { signature });
      throw Object.assign(new Error("Invalid webhook signature."), { statusCode: 400 });
    }

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw Object.assign(new Error("Invalid JSON body in webhook."), { statusCode: 400 });
    }

    const { event } = payload;
    Logger.info(`Processing Razorpay webhook event: ${event}`);

    // Process payment.captured or order.paid events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (!orderId) {
        return { success: true, message: "No order ID present in event payload." };
      }

      // Find Payment document by orderId
      const paymentDoc = await PaymentModel.findOne({ orderId });
      if (!paymentDoc) {
        Logger.warn(`Webhook received for unknown orderId: ${orderId}`);
        return { success: true, message: "Payment order not found in platform database." };
      }

      // Idempotent check
      if (paymentDoc.status === PaymentStatus.PAID) {
        Logger.info(`Payment order ${orderId} is already marked paid.`);
        return { success: true, message: "Payment already processed idempotently." };
      }

      // Update payment record
      paymentDoc.status = PaymentStatus.PAID;
      if (paymentId) paymentDoc.paymentId = paymentId;
      await paymentDoc.save();

      // Create enrollments idempotently
      const student = await UserModel.findOne({ id: paymentDoc.userId });
      const studentName = student?.name || paymentDoc.userName || "Enrolled Student";
      const studentEmail = student?.email || paymentDoc.userEmail || "student@totc.com";

      const courseIds = paymentDoc.courseIds && paymentDoc.courseIds.length > 0
        ? paymentDoc.courseIds
        : [paymentDoc.courseId];

      for (const courseId of courseIds) {
        if (!courseId || courseId === "multi") continue;
        const course = await CourseModel.findOne({ id: courseId }).select("title price");
        if (!course) continue;

        try {
          await EnrollmentModel.create({
            id: `enr_${paymentDoc.id}_${courseId}`,
            studentId: paymentDoc.userId,
            studentName,
            studentEmail,
            courseId,
            courseTitle: course.title,
            amountPaid: course.price,
            paymentMethod: "Razorpay",
            status: "completed",
          });
        } catch (err: any) {
          // Ignore duplicate key error if enrollment was already created synchronously
          if (err?.code !== 11000) {
            Logger.error(`Failed to create enrollment for course ${courseId} via webhook`, { error: err });
          }
        }
      }

      Logger.info(`Successfully processed webhook for order ${orderId}`);
      return { success: true, message: "Webhook processed and enrollment verified." };
    }

    return { success: true, message: `Event ${event} acknowledged.` };
  }
}
