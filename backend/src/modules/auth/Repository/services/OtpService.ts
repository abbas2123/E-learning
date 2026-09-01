import type { IOtpService } from "../../interface/IOtpService";
import type { IEmailService } from "../../interface/IEmailService";

export class OtpService implements IOtpService {
  constructor(private emailService: IEmailService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    // Dispatch in background so the user is not stalled waiting for SMTP network response
    this.emailService.sendOtpEmail(email, otp).catch((err) => {
      console.error(`[OTP SERVICE] Failed to send OTP email to ${email}:`, err?.message || err);
    });
  }
}
