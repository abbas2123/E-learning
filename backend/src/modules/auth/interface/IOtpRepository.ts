export interface IOtpRepository {
  saveOtp(email: string, otp: string, expiresAt: Date): Promise<void>;
  findOtp(email: string): Promise<{ email: string; otp: string; expiresAt: Date } | null>;
  deleteOtp(email: string): Promise<void>;
}
