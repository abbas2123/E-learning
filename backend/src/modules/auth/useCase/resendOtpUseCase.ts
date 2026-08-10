import { IUserRepository } from "../interface/IUserRepository";
import { IOtpRepository } from "../interface/IOtpRepository";
import { IOtpService } from "../interface/IOtpService";
import { ResendOtpDto } from "../dtos/ResendOtpDto";

export class ResendOtpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository,
    private otpService: IOtpService,
  ) {}

  async execute(dto: ResendOtpDto) {
    const { email } = dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User does not exist.");
    }

    if (user.isEmailVerified()) {
      throw new Error("Email is already verified.");
    }

    const otp = this.otpService.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.otpRepository.saveOtp(email, otp, expiresAt);
    await this.otpService.sendOtp(email, otp);

    return {
      success: true,
      message: "New OTP verification code sent to your email.",
    };
  }
}
