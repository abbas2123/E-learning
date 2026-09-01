export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, unknown> | null;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Invalid input payload",
    details: Record<string, unknown> | null = null,
  ) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor(message = "Invalid or expired refresh token.") {
    super(message, 401, "INVALID_REFRESH_TOKEN");
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password.") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class UserBlockedError extends AppError {
  constructor(message = "Your account has been blocked by the administrator.") {
    super(message, 403, "USER_BLOCKED");
  }
}

export class AccountNotVerifiedError extends AppError {
  public readonly requireOtp = true;
  public readonly email?: string;

  constructor(email?: string) {
    super(
      "Account not verified. An OTP code has been sent to your email.",
      403,
      "ACCOUNT_NOT_VERIFIED",
    );
    this.email = email;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource state conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class OtpInvalidError extends AppError {
  constructor(message = "Incorrect OTP code. Please try again.") {
    super(message, 400, "OTP_INVALID");
  }
}

export class OtpExpiredError extends AppError {
  constructor(message = "OTP code has expired. Please request a new code.") {
    super(message, 400, "OTP_EXPIRED");
  }
}

export class VideoWatchTimeInsufficientError extends AppError {
  constructor(message: string) {
    super(message, 422, "VIDEO_WATCH_TIME_INSUFFICIENT");
  }
}

export class EnrollmentRequiredError extends AppError {
  constructor(message = "Active enrollment is required for this action.") {
    super(message, 403, "ENROLLMENT_REQUIRED");
  }
}

export class PaymentError extends AppError {
  constructor(
    message = "Payment processing error",
    details: Record<string, unknown> | null = null,
  ) {
    super(message, 400, "PAYMENT_ERROR", details);
  }
}

export class MediaError extends AppError {
  constructor(message = "Media processing error") {
    super(message, 400, "MEDIA_ERROR");
  }
}
