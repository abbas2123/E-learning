import { NextFunction, Request, Response } from "express";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { RegisterUseCase } from "../useCase/registerUseCase";
import { LoginUseCase } from "../useCase/loginUseCase";
import { LoginUserDTO } from "../dtos/LoginUserDto";
import { VerifyOtpUseCase } from "../useCase/verifyOtpUseCase";
import { ResendOtpUseCase } from "../useCase/resendOtpUseCase";
import { VerifyOtpDto } from "../dtos/VerifyOtpDto";
import { ResendOtpDto } from "../dtos/ResendOtpDto";
import { ForgotPassUseCase } from "../useCase/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../useCase/resetPasswordUseCase";
import { ResetPasswordDto } from "../dtos/ResetPasswordDto";
import { RefreshTokenUseCase } from "../useCase/refreshTokenUseCase";
import { AdminLoginUseCase } from "../useCase/AdminLoginUseCase";
export class AuthControler {
  constructor(
    private readonly registeruseCase: RegisterUseCase,
    private readonly loginuseCase: LoginUseCase,
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly verifyOtpuseCase: VerifyOtpUseCase,
    private readonly resendOtpuseCase: ResendOtpUseCase,
    private readonly forgotPasswordUsecase: ForgotPassUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: RegisterUserDto = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role === "instructor" ? "instructor" : "student",
      };

      const result = await this.registeruseCase.execute(dto);

      return res.status(201).json({
        success: true,
        requireOtp: true,
        email: result.email,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async Login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: LoginUserDTO = {
        email: req.body.email,
        password: req.body.password,
      };
      const result = await this.loginuseCase.execute(dto);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return res.status(200).json({
        success: true,
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      if (error.requireOtp) {
        return res.status(403).json({
          success: false,
          code: error.code || "ACCOUNT_NOT_VERIFIED",
          requireOtp: true,
          email: error.email,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: VerifyOtpDto = {
        email: req.body.email,
        otp: req.body.otp,
        purpose: req.body.purpose,
      };
      const result = await this.verifyOtpuseCase.execute(dto);
      if (result.type === "PASSWORD_RESET") {
        return res.status(200).json({
          success: true,
          type: "PASSWORD_RESET",
          message: "OTP verified successfully",

          resetToken: result.resetToken,
        });
      }
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days

        path: "/",
      });

      return res.status(200).json({
        success: true,
        user: {
          id: result.user.getId(),
          name: result.user.getName(),
          email: result.user.getEmail(),
          role: result.user.getRole(),
          isVerified: result.user.isEmailVerified(),
        },
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ResendOtpDto = {
        email: req.body.email,
      };

      const result = await this.resendOtpuseCase.execute(dto);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
  async forgotPass(req: Request, res: Response, next: NextFunction) {
    try {
      await this.forgotPasswordUsecase.execute({
        email: req.body.email,
      });
      return res.status(200).json({
        message: "OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ResetPasswordDto = {
        resetToken: req.body.resetToken,

        password: req.body.password,
      };
      await this.resetPasswordUseCase.execute(dto);

      return res.status(200).json({
        success: true,

        message: "Password reset successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token missing.",
        });
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);

      return res.status(200).json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.adminLoginUseCase.execute({
        email: req.body.email,
        password: req.body.password,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.status(200).json({
        success: true,
        user: {
          id: result.user.getId(),
          name: result.user.getName(),
          email: result.user.getEmail(),
          role: result.user.getRole(),
          isVerified: result.user.isEmailVerified(),
        },
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
}
