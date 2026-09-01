import Razorpay from "razorpay";
import type { IPaymentRepository } from "../interface/IPaymentRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { CourseModel } from "../../course/repository/database/Course";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { ConflictError, NotFoundError } from "../../../core/errors/AppError";

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  courseTitle: string;
}

export class CreateOrderUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(userId: string, courseId: string): Promise<CreateOrderResult> {
    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    if (!user) {
      throw new NotFoundError(
        "Authenticated user not found.",
        "USER_NOT_FOUND",
      );
    }

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) {
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
    }

    // Duplicate check
    const existingEnrollment = await EnrollmentModel.findOne({
      studentId: user.id || userId,
      courseId,
      status: "completed",
    });

    if (existingEnrollment) {
      throw new ConflictError(
        "You are already enrolled in this course.",
        "ALREADY_ENROLLED",
      );
    }

    // Always determine price server-side in INR
    const amountInRupees = course.price ?? 49;
    const amountInPaise = Math.round(amountInRupees * 100);
    const currency = "INR";

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_totclearn";
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET || "totc_razorpay_secret_key";

    let orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            userId: user.id,
            courseId: course.id,
          },
        });

        orderId = order.id;
      }
    } catch (err) {
      console.warn(
        "Razorpay API order creation warning, using server test order ID fallback:",
        err,
      );
    }

    // Persist pending payment in MongoDB
    await this.paymentRepository.createPendingPayment({
      userId: user.id || userId,
      userEmail: user.email,
      userName: user.name,
      courseId: course.id || courseId,
      courseTitle: course.title,
      amount: amountInRupees,
      currency,
      orderId,
    });

    return {
      orderId,
      amount: amountInRupees,
      currency,
      keyId,
      courseTitle: course.title,
    };
  }
}
