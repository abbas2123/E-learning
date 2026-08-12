import { authController } from "../composition/auth.container";
import { Router } from "express";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.Login.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post("/forgot-password", authController.forgotPass.bind(authController));
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController),
);
router.post(
  "/refresh",

  authController.refreshToken.bind(authController),
);
export default router;
