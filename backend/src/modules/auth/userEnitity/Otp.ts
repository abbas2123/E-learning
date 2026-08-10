export type OtpPurpose = "SIGNUP" | "RESET_PASSWORD" | "CHANGE_EMAIL";
export type CreateOtpProps = {
  email: string;
  hashedOtp: string;
  purpose: OtpPurpose;
};

export interface OtpPersistenceProps {
  email: string;
  hashedOtp: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
}

export class Otp {
  private constructor(
    private readonly email: string,
    private readonly hashedOtp: string,
    private readonly purpose: OtpPurpose,
    private readonly expiresAt: Date,
    private attempts: number,
  ) {}

  static create(props: CreateOtpProps): Otp {
    if (props.email.trim() === "") {
      throw new Error("Email is required");
    }

    if (props.hashedOtp.trim() === "") {
      throw new Error("OTP is required");
    }

    if (props.purpose.trim() === "") {
      throw new Error("Purpose is required");
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    return new Otp(
      props.email.trim().toLowerCase(),
      props.hashedOtp,
      props.purpose,
      expiresAt,
      0,
    );
  }

  static fromPersistence(props: OtpPersistenceProps): Otp {
    return new Otp(
      props.email,
      props.hashedOtp,
      props.purpose,
      props.expiresAt,
      props.attempts,
    );
  }

  toPersistence(): OtpPersistenceProps {
    return {
      email: this.email,
      hashedOtp: this.hashedOtp,
      purpose: this.purpose,
      expiresAt: this.expiresAt,
      attempts: this.attempts,
    };
  }

  isExpired(): boolean {
    return Date.now() > this.expiresAt.getTime();
  }

  incrementAttempts(): void {
    this.attempts++;
  }

  hasExceededAttempts(maxAttempts = 5): boolean {
    return this.attempts >= maxAttempts;
  }

  getEmail(): string {
    return this.email;
  }

  getPurpose(): string {
    return this.purpose;
  }

  getHashedOtp(): string {
    return this.hashedOtp;
  }
}
