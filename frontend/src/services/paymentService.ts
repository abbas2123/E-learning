import apiClient from "./apiClient";

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  courseTitle: string;
}

export interface MultiCourseOrderItem {
  courseId: string;
  title: string;
  price: number;
}

export interface CreateMultiOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  courses: MultiCourseOrderItem[];
}

export interface PaymentTransactionRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  courseIds?: string[];
  courseTitles?: string[];
  amount: number;
  currency: string;
  orderId: string;
  paymentId?: string;
  status: "created" | "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
}

export const paymentService = {
  async createOrder(courseId: string): Promise<CreateOrderResponse> {
    const res = await apiClient.post<{ success: boolean; data: CreateOrderResponse }>(
      "/api/payments/create-order",
      { courseId },
    );
    return res.data.data;
  },

  async verifyPayment(params: {
    courseId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }): Promise<boolean> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      "/api/payments/verify",
      params,
    );
    return res.data.success;
  },

  async createMultiOrder(courseIds: string[]): Promise<CreateMultiOrderResponse> {
    const res = await apiClient.post<{ success: boolean; data: CreateMultiOrderResponse }>(
      "/api/payments/create-multi-order",
      { courseIds },
    );
    return res.data.data;
  },

  async verifyMultiPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }): Promise<{ success: boolean; enrolledCourseIds: string[] }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { success: boolean; enrolledCourseIds: string[] };
    }>("/api/payments/verify-multi-order", params);
    return res.data.data;
  },

  async getHistory(): Promise<PaymentTransactionRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: PaymentTransactionRecord[] }>(
      "/api/payments/history",
    );
    return res.data.data || [];
  },
};
