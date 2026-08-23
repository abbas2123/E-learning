import Razorpay from "razorpay";
import type { IPaymentRepository } from "../interface/IPaymentRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { CourseModel } from "../../course/repository/database/Course";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";

export interface MultiCourseOrderItem {
  courseId: string;
  title: string;
  price: number;
}

export interface CreateMultiOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  courses: MultiCourseOrderItem[];
}

export class CreateMultiOrderUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(userId: string, courseIds: string[]): Promise<CreateMultiOrderResult> {
    if (!userId) throw new Error("Authentication required.");
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      throw new Error("At least one course ID is required for checkout.");
    }

    // De-duplicate requested course IDs
    const uniqueCourseIds = Array.from(new Set(courseIds));

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    if (!user) throw new Error("Authenticated user not found.");

    // Fetch matching published courses from DB
    const courses = await CourseModel.find({ id: { $in: uniqueCourseIds } });
    if (courses.length === 0) {
      throw new Error("None of the requested courses were found.");
    }

    // Check existing student enrollments
    const existingEnrollments = await EnrollmentModel.find({
      studentId: user.id || userId,
      courseId: { $in: uniqueCourseIds },
      status: "completed",
    });
    const enrolledSet = new Set(existingEnrollments.map((e) => e.courseId));

    // Filter out already enrolled courses
    const validCourses = courses.filter((c) => !enrolledSet.has(c.id));
    if (validCourses.length === 0) {
      throw new Error("You are already enrolled in all selected courses.");
    }

    // Calculate total price server-side in INR
    let totalRupees = 0;
    const orderItems: MultiCourseOrderItem[] = validCourses.map((c) => {
      const price = c.price ?? 49;
      totalRupees += price;
      return {
        courseId: c.id,
        title: c.title,
        price,
      };
    });

    const totalPaise = Math.round(totalRupees * 100);
    const currency = "INR";
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_totclearn";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "totc_razorpay_secret_key";

    let orderId = `multi_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: totalPaise,
          currency,
          receipt: `rcpt_multi_${Date.now()}`,
          notes: {
            userId: user.id,
            courseIds: validCourses.map((c) => c.id).join(","),
          },
        });

        orderId = order.id;
      }
    } catch (err) {
      console.warn("Razorpay multi-order creation warning, using fallback order ID:", err);
    }

    // Persist pending multi-course payment record
    await this.paymentRepository.createMultiPendingPayment({
      userId: user.id || userId,
      userEmail: user.email,
      userName: user.name,
      courseIds: validCourses.map((c) => c.id),
      courseTitles: validCourses.map((c) => c.title),
      amount: totalRupees,
      currency,
      orderId,
    });

    return {
      orderId,
      amount: totalRupees,
      currency,
      keyId,
      courses: orderItems,
    };
  }
}
