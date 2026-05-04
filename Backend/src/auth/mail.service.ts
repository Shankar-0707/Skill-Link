import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

// Extend global process.env types with custom environment variables
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      // Email Configuration
      MAIL_MODE?: 'resend' | 'smtp' | 'log';
      RESEND_API_KEY?: string;
      MAIL_FROM?: string;
      CONTACT_INBOX_EMAIL?: string;

      // SMTP Configuration
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string; // 'true' or 'false'
      SMTP_USER?: string;
      SMTP_PASS?: string;

      // Email URLs & Expiration
      VERIFY_EMAIL_URL?: string;
      RESET_PASSWORD_URL?: string;
      EMAIL_VERIFICATION_EXPIRES_MINUTES?: string;
      PASSWORD_RESET_EXPIRES_MINUTES?: string;

      // JWT Configuration
      JWT_ACCESS_SECRET?: string;
      JWT_ACCESS_EXPIRES_IN?: string;
      JWT_REFRESH_SECRET?: string;
      JWT_REFRESH_EXPIRES_DAYS?: string;

      // Google OAuth
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      GOOGLE_CALLBACK_URL?: string;
      FRONTEND_AUTH_CALLBACK_URL?: string;

      // Database
      DATABASE?: string;
      DATABASE_URL?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;

      // Cloudinary
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
}

type VerificationMailInput = {
  to: string;
  name?: string;
  token: string;
  verificationUrl?: string;
  expiresInMinutes: number;
};

type ResetMailInput = {
  to: string;
  name?: string;
  token: string;
  resetUrl?: string;
  expiresInMinutes: number;
};

type ContactInquiryMailInput = {
  fullName: string;
  email: string;
  message: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initClients();
  }

  private initClients() {
    const mode = process.env.MAIL_MODE ?? 'log';

    if (mode === 'resend') {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        this.resend = new Resend(apiKey);
      } else {
        this.logger.warn('MAIL_MODE=resend but RESEND_API_KEY is missing');
      }
    } else if (mode === 'smtp') {
      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port: parseInt(process.env.SMTP_PORT ?? '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user, pass },
        });
      } else {
        this.logger.warn('MAIL_MODE=smtp but SMTP credentials are incomplete');
      }
    }
  }

  async sendEmailVerification(input: VerificationMailInput) {
    const subject = 'Verify your Skill-Link email';
    const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
    const plainVerificationLink = input.verificationUrl
      ? `Verification link: ${input.verificationUrl}`
      : `Verification token: ${input.token}`;

    await this.sendMail({
      to: input.to,
      subject,
      text: `${greeting}\n\nUse the following to verify your email. It expires in ${input.expiresInMinutes} minutes.\n\n${plainVerificationLink}\n\nIf you did not sign up, you can ignore this email.`,
      html: this.buildHtmlEmail({
        greeting,
        bodyHtml: `
          <p>Use the link below to verify your email address. It expires in <strong>${input.expiresInMinutes} minutes</strong>.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${input.verificationUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              Verify Email
            </a>
          </p>
          <p>Or paste this link in your browser:</p>
          <p style="word-break:break-all;color:#4f46e5;">${input.verificationUrl ?? input.token}</p>
          <p style="color:#6b7280;font-size:13px;">If you did not sign up for Skill-Link, you can safely ignore this email.</p>
        `,
      }),
    });
  }

  async sendPasswordReset(input: ResetMailInput) {
    const subject = 'Reset your Skill-Link password';
    const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
    const plainResetLink = input.resetUrl
      ? `Reset link: ${input.resetUrl}`
      : `Reset token: ${input.token}`;

    await this.sendMail({
      to: input.to,
      subject,
      text: `${greeting}\n\nUse the following to reset your password. It expires in ${input.expiresInMinutes} minutes.\n\n${plainResetLink}\n\nIf you did not request this, you can ignore this email.`,
      html: this.buildHtmlEmail({
        greeting,
        bodyHtml: `
          <p>We received a request to reset your Skill-Link password. Click the button below to proceed. This link expires in <strong>${input.expiresInMinutes} minutes</strong>.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${input.resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              Reset Password
            </a>
          </p>
          <p>Or paste this link in your browser:</p>
          <p style="word-break:break-all;color:#4f46e5;">${input.resetUrl ?? input.token}</p>
          <p style="color:#6b7280;font-size:13px;">If you did not request a password reset, please ignore this email. Your password will not change.</p>
        `,
      }),
    });
  }

  async sendContactInquiry(input: ContactInquiryMailInput) {
    const inboxEmail =
      process.env.CONTACT_INBOX_EMAIL ?? 'linkskillofficial@gmail.com';
    const submittedAt = new Date().toISOString();

    await this.sendMail({
      to: inboxEmail,
      subject: `New Skill-Link contact inquiry from ${input.fullName}`,
      text: [
        'A new contact inquiry was submitted on the Skill-Link landing page.',
        '',
        `Name: ${input.fullName}`,
        `Email: ${input.email}`,
        `Submitted At (UTC): ${submittedAt}`,
        '',
        'Message:',
        input.message,
      ].join('\n'),
      html: this.buildHtmlEmail({
        greeting: 'Hi Team,',
        bodyHtml: `
          <p>A new contact inquiry was submitted on the Skill-Link landing page.</p>
          <p><strong>Name:</strong> ${this.escapeHtml(input.fullName)}</p>
          <p><strong>Email:</strong> ${this.escapeHtml(input.email)}</p>
          <p><strong>Submitted At (UTC):</strong> ${submittedAt}</p>
          <p style="margin:20px 0 8px;"><strong>Message:</strong></p>
          <div style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;white-space:pre-wrap;">${this.escapeHtml(
            input.message,
          )}</div>
        `,
      }),
    });
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    const mode = process.env.MAIL_MODE ?? 'log';

    if (mode === 'log') {
      this.logger.log(
        `MAIL_MODE=log | To: ${options.to} | Subject: ${options.subject}`,
      );
      this.logger.log(options.text);
      return;
    }

    if (mode === 'smtp') {
      return this.sendMailViaSmtp(options);
    }

    return this.sendMailViaResend(options);
  }

  private async sendMailViaSmtp(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialised. Check credentials.');
    }

    const from = process.env.MAIL_FROM ?? process.env.SMTP_USER;
    
    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    this.logger.log(`Email sent via SMTP to ${options.to}`);
  }

  private async sendMailViaResend(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    if (!this.resend) {
      throw new Error(
        'Resend client is not initialised. Ensure RESEND_API_KEY is set.',
      );
    }

    const from = process.env.MAIL_FROM;
    if (!from) {
      throw new Error('MAIL_FROM is not set. Set it in environment variables.');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (error) {
        this.logger.error(
          `Resend API error sending to ${options.to}: ${JSON.stringify(error)}`,
        );
        throw new Error(`Resend error: ${JSON.stringify(error)}`);
      }

      this.logger.log(
        `Email sent via Resend to ${options.to} | id: ${data?.id}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send email via Resend to ${options.to}. Subject: ${options.subject}`,
        err instanceof Error ? err.message : String(err),
      );
      throw err;
    }
  }

  /**
   * Builds a clean, branded HTML email wrapper.
   */
  private buildHtmlEmail({
    greeting,
    bodyHtml,
  }: {
    greeting: string;
    bodyHtml: string;
  }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Skill-Link</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Skill-Link</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#1f2937;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;">${greeting}</p>
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} Skill-Link. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
