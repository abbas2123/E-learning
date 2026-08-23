import type { Request, Response, NextFunction } from "express";
import type { CreateOrderUseCase } from "../useCase/CreateOrderUseCase";
import type { VerifyPaymentUseCase } from "../useCase/VerifyPaymentUseCase";
import type { CreateMultiOrderUseCase } from "../useCase/CreateMultiOrderUseCase";
import type { VerifyMultiPaymentUseCase } from "../useCase/VerifyMultiPaymentUseCase";
import type { GetPaymentHistoryUseCase } from "../useCase/GetPaymentHistoryUseCase";
import type { ProcessRazorpayWebhookUseCase } from "../useCase/ProcessRazorpayWebhookUseCase";

export class PaymentController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly verifyPaymentUseCase: VerifyPaymentUseCase,
    private readonly createMultiOrderUseCase: CreateMultiOrderUseCase,
    private readonly verifyMultiPaymentUseCase: VerifyMultiPaymentUseCase,
    private readonly getPaymentHistoryUseCase: GetPaymentHistoryUseCase,
    private readonly processRazorpayWebhookUseCase: ProcessRazorpayWebhookUseCase,
  ) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ success: false, message: "courseId is required." });
      }

      const order = await this.createOrderUseCase.execute(userId, courseId);
      return res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!courseId || !razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({
          success: false,
          message: "Missing payment verification parameters.",
        });
      }

      const success = await this.verifyPaymentUseCase.execute({
        userId,
        courseId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || "",
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified & course enrolled successfully.",
      });
    } catch (error: any) {
      next(error);
    }
  }

  async createMultiOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { courseIds } = req.body;

      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "courseIds array is required.",
        });
      }

      const orderResult = await this.createMultiOrderUseCase.execute(userId, courseIds);
      return res.status(201).json({
        success: true,
        data: orderResult,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyMultiPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({
          success: false,
          message: "Missing razorpay_order_id or razorpay_payment_id.",
        });
      }

      const result = await this.verifyMultiPaymentUseCase.execute({
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || "",
      });

      return res.status(200).json({
        success: true,
        message: "Multi-course payment verified & enrollments created successfully.",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = String(req.headers["x-razorpay-signature"] || "");
      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

      const result = await this.processRazorpayWebhookUseCase.execute(rawBody, signature);
      return res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const history = await this.getPaymentHistoryUseCase.execute(userId);
      return res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      next(error);
    }
  }

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await this.getPaymentHistoryUseCase.executeAll();
      return res.status(200).json({ success: true, data: payments });
    } catch (error: any) {
      next(error);
    }
  }
}
