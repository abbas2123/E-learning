import { PaymentStatus } from "../database/Payment";

export interface PaymentDto {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  courseIds?: string[];
  courseTitles?: string[];
  amount: number;
  currency: string;
  orderId: string;
  paymentId?: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
}

export interface CreatePaymentParams {
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  orderId: string;
}

export interface CreateMultiPaymentParams {
  userId: string;
  userEmail: string;
  userName: string;
  courseIds: string[];
  courseTitles: string[];
  amount: number;
  currency: string;
  orderId: string;
}

export interface IPaymentRepository {
  createPendingPayment(params: CreatePaymentParams): Promise<PaymentDto>;
  createMultiPendingPayment(params: CreateMultiPaymentParams): Promise<PaymentDto>;
  findByOrderId(orderId: string): Promise<PaymentDto | null>;
  markAsPaid(orderId: string, paymentId: string, signature: string): Promise<PaymentDto>;
  markAsFailed(orderId: string, reason?: string): Promise<void>;
  getUserPayments(userId: string): Promise<PaymentDto[]>;
  getAllPayments(): Promise<PaymentDto[]>;
}
