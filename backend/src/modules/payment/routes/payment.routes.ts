import { Router } from "express";
import { paymentController } from "../composition/payment.container";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";

const router = Router();

// Webhook endpoint (Unauthenticated, verified via HMAC signature)
router.post(
  "/webhook",
  paymentController.handleWebhook.bind(paymentController),
);

// Single-Course Payment Routes
router.post(
  "/create-order",
  authMiddleware,
  paymentController.createOrder.bind(paymentController),
);

router.post(
  "/verify",
  authMiddleware,
  paymentController.verifyPayment.bind(paymentController),
);

// Multi-Course Cart Checkout Routes
router.post(
  "/create-multi-order",
  authMiddleware,
  paymentController.createMultiOrder.bind(paymentController),
);

router.post(
  "/verify-multi-order",
  authMiddleware,
  paymentController.verifyMultiPayment.bind(paymentController),
);

// Payment History & Admin Routes
router.get(
  "/history",
  authMiddleware,
  paymentController.getHistory.bind(paymentController),
);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  paymentController.getAllPayments.bind(paymentController),
);

export default router;
