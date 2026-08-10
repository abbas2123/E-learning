import type { IOtpService } from "../../interface/IOtpService";
import type { IEmailService } from "../../interface/IEmailService";

export class OtpService implements IOtpService {
  constructor(private emailService: IEmailService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    console.log("email:", email, "otp:", otp);
    await this.emailService.sendOtpEmail(email, otp);
  }
}
