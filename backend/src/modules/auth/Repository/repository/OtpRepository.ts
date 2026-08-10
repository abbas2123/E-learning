import type { IOtpRepository } from "../../interface/IOtpRepository";
import { OtpModel } from "../database/Otp";

export class OtpRepository implements IOtpRepository {
  async saveOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
    console.log("otp", otp, "email", email, "expaire", expiresAt);
    await OtpModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), otp, expiresAt },
      { upsert: true, new: true },
    );
  }

  async findOtp(
    email: string,
  ): Promise<{ email: string; otp: string; expiresAt: Date } | null> {
    const doc = await OtpModel.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return {
      email: doc.email,
      otp: doc.otp,
      expiresAt: doc.expiresAt,
    };
  }

  async deleteOtp(email: string): Promise<void> {
    await OtpModel.deleteOne({ email: email.toLowerCase() });
  }
}
