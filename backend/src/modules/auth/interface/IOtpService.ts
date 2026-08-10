export interface IOtpService {
  generateOtp(): string;
  sendOtp(email: string, otp: string): Promise<void>;
}
