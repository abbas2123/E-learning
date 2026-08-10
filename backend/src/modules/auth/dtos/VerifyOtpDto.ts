export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export interface VerifyOtpDto {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}
