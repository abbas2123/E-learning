import { randomUUID } from "crypto";
import { PaymentModel, PaymentStatus } from "../database/Payment";
import type {
  IPaymentRepository,
  PaymentDto,
  CreatePaymentParams,
  CreateMultiPaymentParams,
} from "../interface/IPaymentRepository";

export class PaymentRepository implements IPaymentRepository {
  private toDto(doc: any): PaymentDto {
    return {
      id: doc.id ?? doc._id.toString(),
      userId: doc.userId,
      userEmail: doc.userEmail,
      userName: doc.userName,
      courseId: doc.courseId,
      courseTitle: doc.courseTitle,
      courseIds: doc.courseIds ?? [],
      courseTitles: doc.courseTitles ?? [],
      amount: doc.amount,
      currency: doc.currency,
      orderId: doc.orderId,
      paymentId: doc.paymentId ?? undefined,
      status: doc.status,
      paymentMethod: doc.paymentMethod,
      createdAt: doc.createdAt,
    };
  }

  async createPendingPayment(params: CreatePaymentParams): Promise<PaymentDto> {
    const doc = new PaymentModel({
      id: randomUUID(),
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      courseIds: [params.courseId],
      courseTitles: [params.courseTitle],
      amount: params.amount,
      currency: params.currency || "INR",
      orderId: params.orderId,
      status: PaymentStatus.PENDING,
      paymentMethod: "Razorpay",
    });

    const saved = await doc.save();
    return this.toDto(saved);
  }

  async createMultiPendingPayment(params: CreateMultiPaymentParams): Promise<PaymentDto> {
    const doc = new PaymentModel({
      id: randomUUID(),
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      courseId: params.courseIds.join(","),
      courseTitle: params.courseTitles.join(", "),
      courseIds: params.courseIds,
      courseTitles: params.courseTitles,
      amount: params.amount,
      currency: params.currency || "INR",
      orderId: params.orderId,
      status: PaymentStatus.PENDING,
      paymentMethod: "Razorpay",
    });

    const saved = await doc.save();
    return this.toDto(saved);
  }

  async findByOrderId(orderId: string): Promise<PaymentDto | null> {
    const found = await PaymentModel.findOne({ orderId });
    if (!found) return null;
    return this.toDto(found);
  }

  async markAsPaid(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<PaymentDto> {
    const updated = await PaymentModel.findOneAndUpdate(
      { orderId },
      {
        status: PaymentStatus.PAID,
        paymentId,
        signature,
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new Error(`Payment record with orderId ${orderId} not found.`);
    }

    return this.toDto(updated);
  }

  async markAsFailed(orderId: string): Promise<void> {
    await PaymentModel.findOneAndUpdate(
      { orderId },
      { status: PaymentStatus.FAILED },
    );
  }

  async getUserPayments(userId: string): Promise<PaymentDto[]> {
    const docs = await PaymentModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async getAllPayments(): Promise<PaymentDto[]> {
    const docs = await PaymentModel.find().sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }
}
