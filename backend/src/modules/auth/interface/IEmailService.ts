export interface IEmailService {
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}
