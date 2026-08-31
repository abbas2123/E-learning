import nodemailer, { type Transporter } from "nodemailer";
import type { IEmailService } from "../../interface/IEmailService";
import { Logger } from "../../../../core/logger/Logger.js";

export class EmailService implements IEmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      Logger.info(`[EMAIL SERVICE] SMTP transporter initialized with host: ${host}`);
    } else {
      Logger.info(`[EMAIL SERVICE] SMTP credentials not set. Running in local/test mail mode.`);
    }
  }

  private getFromAddress(): string {
    return (
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      '"TOTC E-Learning" <noreply@totc.com>'
    );
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const from = this.getFromAddress();
    const subject = `${otp} is your TOTC Verification Code`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #49BBBD 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .body { padding: 32px 28px; text-align: center; color: #334155; }
          .otp-box { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 16px; padding: 20px; margin: 24px 0; display: inline-block; width: 80%; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f766e; margin: 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>TOTC E-Learning</h1>
          </div>
          <div class="body">
            <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Verify Your Email Address</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
              Thank you for registering with TOTC. Please use the following 6-digit OTP code to complete your verification:
            </p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">
              This verification code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} TOTC E-Learning Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    Logger.info(`[EMAIL SERVICE] Dispatching OTP verification email`, {
      recipient: email.replace(/(?<=.{2}).(?=[^@]*?@)/g, "*"),
      hasTransporter: !!this.transporter,
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject,
          html,
        });
        Logger.info(`[EMAIL SERVICE] OTP email successfully sent to recipient`);
      } catch (err: any) {
        Logger.error(`[EMAIL SERVICE] Failed to send OTP email`, { error: err?.message });
      }
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const from = this.getFromAddress();
    const subject = `Welcome to TOTC E-Learning, ${name}! 🎉`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
          .body { padding: 32px 28px; text-align: center; color: #334155; }
          .btn { background: #49BBBD; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; display: inline-block; margin-top: 20px; font-size: 14px; shadow: 0 4px 12px rgba(73, 187, 189, 0.4); }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Welcome to TOTC! 🚀</h1>
          </div>
          <div class="body">
            <h2 style="font-size: 22px; color: #0f172a; margin-top: 0;">Hi ${name}, Your Account is Active!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              We are thrilled to welcome you to the TOTC community. Your email verification is complete, and your student workspace is ready.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Explore interactive courses, connect with mentors, and start learning today!
            </p>
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" class="btn" style="color:#ffffff;">
              Go to Learning Workspace →
            </a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} TOTC E-Learning Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    Logger.info(`[EMAIL SERVICE] Dispatching welcome email`, {
      recipient: email.replace(/(?<=.{2}).(?=[^@]*?@)/g, "*"),
      hasTransporter: !!this.transporter,
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject,
          html,
        });
        Logger.info(`[EMAIL SERVICE] Welcome email successfully sent to recipient`);
      } catch (err: any) {
        Logger.error(`[EMAIL SERVICE] Failed to send welcome email`, { error: err?.message });
      }
    }
  }
}
