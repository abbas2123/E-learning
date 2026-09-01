import { UserRepository } from "../Repository/repository/UserRepository";
import { PasswordService } from "../Repository/services/PasswordService";
import { JwtService } from "../Repository/services/JwtService";
import { OtpRepository } from "../Repository/repository/OtpRepository";
import { OtpService } from "../Repository/services/OtpService";

import { RegisterUseCase } from "../useCase/registerUseCase";
import { LoginUseCase } from "../useCase/loginUseCase";
import { VerifyOtpUseCase } from "../useCase/verifyOtpUseCase";
import { ResendOtpUseCase } from "../useCase/resendOtpUseCase";
import { AuthControler } from "../controllers/AuthController";
import { EmailService } from "../Repository/services/EmailService";
import { ForgotPassUseCase } from "../useCase/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../useCase/resetPasswordUseCase";
import { RefreshTokenUseCase } from "../useCase/refreshTokenUseCase";
import { AdminLoginUseCase } from "../useCase/AdminLoginUseCase";
import { AuthenticateUserUseCase } from "../useCase/AuthenticateUserUseCase";
import { createAuthMiddleware } from "../../../middlewares/authMiddleware";
const userRepository = new UserRepository();
const passwordService = new PasswordService();
const jwtService = new JwtService();
const otpRepository = new OtpRepository();
const emailService = new EmailService();
const otpService = new OtpService(emailService);

const registerUseCase = new RegisterUseCase(
  userRepository,
  passwordService,
  otpRepository,
  otpService,
);

const loginUseCase = new LoginUseCase(
  passwordService,
  userRepository,
  jwtService,
  otpRepository,
  otpService,
);

const verifyOtpUseCase = new VerifyOtpUseCase(
  userRepository,
  otpRepository,
  jwtService,
  emailService,
  passwordService,
);

const resendOtpUseCase = new ResendOtpUseCase(
  userRepository,
  otpRepository,
  otpService,
);
const forgotpassUseCase = new ForgotPassUseCase(
  userRepository,
  otpRepository,
  passwordService,
  otpService,
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  userRepository,
  passwordService,
);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, jwtService);
const adminLoginUseCase = new AdminLoginUseCase(
  userRepository,
  passwordService,
  jwtService,
);
const authenticateUserUseCase = new AuthenticateUserUseCase(
  userRepository,
  jwtService,
);
export const authMiddleware = createAuthMiddleware(authenticateUserUseCase);
export const authController = new AuthControler(
  registerUseCase,
  loginUseCase,
  adminLoginUseCase,
  verifyOtpUseCase,
  resendOtpUseCase,
  forgotpassUseCase,
  resetPasswordUseCase,
  refreshTokenUseCase,
);
