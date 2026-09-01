import { IUserRepository } from "../interface/IUserRepository";
import { IOtpRepository } from "../interface/IOtpRepository";
import { IJwtService } from "../interface/IJwtService";
import { IEmailService } from "../interface/IEmailService";
import { VerifyOtpDto } from "../dtos/VerifyOtpDto";
import { IPasswordService } from "../interface/IPasswordService";
import crypto from "crypto";
export class VerifyOtpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository,
    private jwtService: IJwtService,
    private emailService: IEmailService,
    private passwordService: IPasswordService,
  ) {}

  async execute(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    const otpRecord = await this.otpRepository.findOtp(email);
    if (!otpRecord) {
      throw new Error("Invalid or expired OTP code.");
    }

    // if (otpRecord.otp !== otp) {
    //   throw new Error("Incorrect OTP code. Please try again.");
    // }
    if (new Date() > otpRecord.expiresAt) {
      await this.otpRepository.deleteOtp(email);
      throw new Error("OTP code has expired. Please request a new code.");
    }
    const isValid = await this.passwordService.compare(otp, otpRecord.otp);
    if (!isValid) {
      throw new Error("Incorrect OTP code. Please try again.");
    }
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User does not exist.");
    }
    if (dto.purpose === "EMAIL_VERIFICATION") {
      // Set isVerified = true and status = ACTIVE
      user.verifyEmail();
      const updatedUser = await this.userRepository.update(user);

      // Delete used OTP
      await this.otpRepository.deleteOtp(email);

      // Send Welcome Email via Nodemailer asynchronously
      this.emailService
        .sendWelcomeEmail(user.getEmail(), user.getName())
        .catch((err) => {
          console.error(
            `Failed to send welcome email to ${user.getEmail()}:`,
            err,
          );
        });

      const accessToken = this.jwtService.generateAccessToken(
        updatedUser.getId(),
      );
      const refreshToken = this.jwtService.generateRefreshToken(
        updatedUser.getId(),
      );

      return {
        type: "EMAIL_VERIFICATION" as const,
        user: updatedUser,
        accessToken,
        refreshToken,
      };
    }
    if (dto.purpose === "PASSWORD_RESET") {
      await this.otpRepository.deleteOtp(email);
      const resetToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await this.userRepository.savePasswordResetToken(
        user.getId(),
        hashedToken,
        expiresAt,
      );
      return {
        type: "PASSWORD_RESET" as const,
        resetToken,
      };
    }
    throw new Error("Invalid OTP purpose.");
  }
}
