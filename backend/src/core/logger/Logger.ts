export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  error?: unknown;
  [key: string]: unknown;
}

const REDACT_KEYS = ["password", "token", "jwt", "otp", "secret", "razorpay_signature", "authorization"];

function sanitizeData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeData);

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACT_KEYS.some((rk) => key.toLowerCase().includes(rk))) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = sanitizeData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class Logger {
  private static formatLog(level: LogLevel, message: string, context?: LogContext) {
    const isProd = process.env.NODE_ENV === "production";
    const timestamp = new Date().toISOString();
    const cleanContext = context ? sanitizeData(context) : undefined;

    if (isProd) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...cleanContext,
      });
    }

    const contextStr = cleanContext ? ` | ${JSON.stringify(cleanContext)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  static info(message: string, context?: LogContext) {
    console.log(this.formatLog("info", message, context));
  }

  static warn(message: string, context?: LogContext) {
    console.warn(this.formatLog("warn", message, context));
  }

  static error(message: string, context?: LogContext) {
    console.error(this.formatLog("error", message, context));
  }

  static debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.log(this.formatLog("debug", message, context));
    }
  }
}
