import { PaymentRepository } from "../repository/PaymentRepository";
import { CreateOrderUseCase } from "../useCase/CreateOrderUseCase";
import { VerifyPaymentUseCase } from "../useCase/VerifyPaymentUseCase";
import { CreateMultiOrderUseCase } from "../useCase/CreateMultiOrderUseCase";
import { VerifyMultiPaymentUseCase } from "../useCase/VerifyMultiPaymentUseCase";
import { GetPaymentHistoryUseCase } from "../useCase/GetPaymentHistoryUseCase";
import { ProcessRazorpayWebhookUseCase } from "../useCase/ProcessRazorpayWebhookUseCase";
import { PaymentController } from "../controller/PaymentController";

const paymentRepository = new PaymentRepository();

const createOrderUseCase = new CreateOrderUseCase(paymentRepository);
const verifyPaymentUseCase = new VerifyPaymentUseCase(paymentRepository);
const createMultiOrderUseCase = new CreateMultiOrderUseCase(paymentRepository);
const verifyMultiPaymentUseCase = new VerifyMultiPaymentUseCase(paymentRepository);
const getPaymentHistoryUseCase = new GetPaymentHistoryUseCase(paymentRepository);
const processRazorpayWebhookUseCase = new ProcessRazorpayWebhookUseCase();

export const paymentController = new PaymentController(
  createOrderUseCase,
  verifyPaymentUseCase,
  createMultiOrderUseCase,
  verifyMultiPaymentUseCase,
  getPaymentHistoryUseCase,
  processRazorpayWebhookUseCase,
);
